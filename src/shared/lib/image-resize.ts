import imageCompression from 'browser-image-compression';

/**
 * 이미지 리사이징 옵션
 */
export interface ImageResizeOptions {
  /** 최대 너비 (픽셀) */
  maxWidth?: number;
  /** 최대 높이 (픽셀) */
  maxHeight?: number;
  /** 최대 파일 크기 (MB) */
  maxSizeMB?: number;
  /** 이미지 품질 (0-1, 기본값: 0.8) */
  quality?: number;
  /** 출력 파일 형식 (기본값: 'image/jpeg') */
  fileType?: string;
  /** 초기 파일 크기 확인 후 리사이징 필요 여부 판단 (기본값: true) */
  checkOrientation?: boolean;
}

/**
 * 기본 이미지 리사이징 옵션
 */
const DEFAULT_OPTIONS: Required<ImageResizeOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  maxSizeMB: 2,
  quality: 0.8,
  fileType: 'image/jpeg',
  checkOrientation: true,
};

/**
 * 이미지 파일을 리사이징합니다.
 * 
 * @param file 원본 이미지 파일
 * @param options 리사이징 옵션
 * @returns 리사이징된 이미지 파일 (Promise)
 * 
 * @example
 * ```ts
 * const resizedFile = await resizeImage(file, {
 *   maxWidth: 1920,
 *   maxHeight: 1920,
 *   maxSizeMB: 2,
 *   quality: 0.8
 * });
 * ```
 */
export async function resizeImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<File> {
  // 이미지 파일인지 확인
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 리사이징할 수 있습니다.');
  }

  // 옵션 병합
  const resizeOptions: Required<ImageResizeOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  try {
    // 먼저 이미지 크기 확인
    const img = await createImageFromFile(file);
    let targetWidth = img.width;
    let targetHeight = img.height;

    // 최대 너비/높이 제한 적용 (비율 유지)
    if (resizeOptions.maxWidth && targetWidth > resizeOptions.maxWidth) {
      const ratio = resizeOptions.maxWidth / targetWidth;
      targetWidth = resizeOptions.maxWidth;
      targetHeight = Math.round(targetHeight * ratio);
    }

    if (resizeOptions.maxHeight && targetHeight > resizeOptions.maxHeight) {
      const ratio = resizeOptions.maxHeight / targetHeight;
      targetHeight = resizeOptions.maxHeight;
      targetWidth = Math.round(targetWidth * ratio);
    }

    // 리사이징이 필요한 경우
    const needsResize = targetWidth !== img.width || targetHeight !== img.height;
    const maxDimension = Math.max(targetWidth, targetHeight);

    // 이미지 리사이징 및 압축
    const compressedFile = await imageCompression(file, {
      maxSizeMB: resizeOptions.maxSizeMB,
      maxWidthOrHeight: needsResize ? maxDimension : undefined,
      useWebWorker: true,
      fileType: resizeOptions.fileType,
      initialQuality: resizeOptions.quality,
      alwaysKeepResolution: false,
      exifOrientation: resizeOptions.checkOrientation ? undefined : 1,
    });

    // 정확한 크기 조정이 필요한 경우 Canvas로 재리사이징
    if (needsResize) {
      const finalImg = await createImageFromFile(compressedFile);
      
      // 압축 후에도 크기가 맞지 않으면 Canvas로 정확히 리사이징
      if (finalImg.width !== targetWidth || finalImg.height !== targetHeight) {
        const resizedFile = await resizeImageWithCanvas(
          compressedFile,
          targetWidth,
          targetHeight,
          resizeOptions.quality,
          resizeOptions.fileType
        );
        return resizedFile;
      }
    }

    return compressedFile;
  } catch (error) {
    console.error('이미지 리사이징 오류:', error);
    throw new Error('이미지 리사이징에 실패했습니다.');
  }
}

/**
 * File 객체로부터 Image 객체를 생성합니다.
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지 로드에 실패했습니다.'));
    };

    img.src = url;
  });
}

/**
 * Canvas를 사용하여 이미지를 리사이징합니다.
 */
function resizeImageWithCanvas(
  file: File,
  width: number,
  height: number,
  quality: number,
  fileType: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 컨텍스트를 가져올 수 없습니다.'));
        return;
      }

      // 고품질 리사이징을 위한 설정
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 변환에 실패했습니다.'));
            return;
          }

          // 원본 파일명 유지 (확장자는 fileType에 따라 변경될 수 있음)
          const originalName = file.name.split('.')[0];
          const extension = fileType === 'image/png' ? 'png' : 'jpg';
          const fileName = `${originalName}.${extension}`;

          const resizedFile = new File([blob], fileName, {
            type: fileType,
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        fileType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지 로드에 실패했습니다.'));
    };

    img.src = url;
  });
}

/**
 * 이미지 파일의 크기와 해상도를 확인합니다.
 */
export async function getImageInfo(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
}> {
  const img = await createImageFromFile(file);
  return {
    width: img.width,
    height: img.height,
    size: file.size,
    type: file.type,
  };
}

