// import { useSupabase } from '@/src/shared/lib/supabase/client';
import { resizeImage } from '@/src/shared/lib/image-resize';
import { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '../../lib/supabase/client';

/**
 * CKEditor5용 Supabase Storage 업로드 어댑터
 * 
 * CKEditor5의 SimpleUploadAdapter를 확장하여
 * Supabase Storage에 파일을 업로드하는 커스텀 어댑터
 */
export class SupabaseUploadAdapter {
  loader: any;
  bucket: string;
  folder: string;
  supabase: SupabaseClient;
  constructor(loader: any, bucket: string = 'editor-images', folder: string = 'uploads', supabase: SupabaseClient = createBrowserClient()) {
    this.loader = loader;
    this.bucket = bucket;
    this.folder = folder;
    this.supabase = supabase;
  }

  /**
   * 파일 업로드 실행
   */
  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;

    try {
      let fileToUpload = file;

      // 이미지 파일인 경우 리사이징 적용
      if (file.type.startsWith('image/')) {
        try {
          fileToUpload = await resizeImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            maxSizeMB: 1,
            quality: 0.8,
            fileType: 'image/jpeg',
          });
        } catch (resizeError) {
          console.warn('이미지 리사이징 실패, 원본 파일로 업로드:', resizeError);
          // 리사이징 실패 시 원본 파일 사용
          fileToUpload = file;
        }
      }

      // 파일 확장자 추출 (리사이징된 파일의 확장자 사용)
      const fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() || 'jpg';

      // 고유한 파일명 생성
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${this.folder}/${fileName}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('파일 업로드 오류:', uploadError);
        throw new Error(`파일 업로드에 실패했습니다: ${uploadError.message}`);
      }

      // 공개 URL 가져오기
      const { data } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      return {
        default: data.publicUrl,
      };
    } catch (error) {
      console.error('파일 업로드 중 오류:', error);
      throw error;
    }
  }

  /**
   * 업로드 취소 (필요시 구현)
   */
  abort(): void {
    // Supabase Storage는 업로드 취소를 직접 지원하지 않으므로
    // 필요시 별도로 구현할 수 있습니다.
  }
}

/**
 * CKEditor5에 업로드 어댑터를 등록하는 함수
 * 
 * @param editor CKEditor 인스턴스
 * @param bucket Supabase Storage 버킷 이름 (기본값: 'editor-images')
 * @param folder 업로드할 폴더 경로 (기본값: 'uploads')
 */
export function SupabaseUploadAdapterPlugin(
  editor: any,
  bucket: string = 'editor-images',
  folder: string = 'uploads'
) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new SupabaseUploadAdapter(loader, bucket, folder, createBrowserClient());
  };
}

