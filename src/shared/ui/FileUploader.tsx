'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText, FileIcon } from 'lucide-react';
import { Button } from './Button';
import { cn } from './utils';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  file: File;
  url?: string; // 업로드된 파일의 URL (이미 업로드된 경우)
  name: string;
  size: number;
  type: string;
  preview?: string; // 이미지 미리보기용
}

interface FileUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
}

/**
 * 파일 타입에 따른 아이콘 반환
 */
function getFileIcon(type: string) {
  if (type.startsWith('image/')) {
    return ImageIcon;
  }
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
    return FileText;
  }
  return FileIcon;
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function FileUploader({
  files,
  onFilesChange,
  maxFiles = 10,
  maxSizeMB = 50,
  accept,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 파일 유효성 검사
   */
  const validateFile = (file: File): string | null => {
    // 파일 크기 확인
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`;
    }

    // 파일 타입 확인 (accept가 지정된 경우)
    if (accept) {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      const isAccepted = acceptedTypes.some((acceptedType) => {
        if (acceptedType.startsWith('.')) {
          // 확장자로 확인
          return fileName.endsWith(acceptedType.toLowerCase());
        } else if (acceptedType.includes('/*')) {
          // MIME 타입 그룹으로 확인 (예: image/*)
          const group = acceptedType.split('/')[0];
          return fileType.startsWith(`${group}/`);
        } else {
          // 정확한 MIME 타입으로 확인
          return fileType === acceptedType;
        }
      });

      if (!isAccepted) {
        return `지원하지 않는 파일 형식입니다.`;
      }
    }

    return null;
  };

  /**
   * 파일을 UploadedFile 형식으로 변환
   */
  const processFile = async (file: File): Promise<UploadedFile> => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 이미지 파일인 경우 미리보기 생성
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    return {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview,
    };
  };

  /**
   * 파일 추가 처리
   */
  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const fileArray = Array.from(fileList);

      // 최대 파일 개수 확인
      if (files.length + fileArray.length > maxFiles) {
        toast.error(`최대 ${maxFiles}개까지 업로드할 수 있습니다.`);
        return;
      }

      const newFiles: UploadedFile[] = [];

      for (const file of fileArray) {
        // 유효성 검사
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
          continue;
        }

        // 중복 확인
        const isDuplicate = files.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (isDuplicate) {
          toast.warning(`${file.name}: 이미 추가된 파일입니다.`);
          continue;
        }

        try {
          const processedFile = await processFile(file);
          newFiles.push(processedFile);
        } catch (error) {
          console.error('파일 처리 오류:', error);
          toast.error(`${file.name}: 파일 처리 중 오류가 발생했습니다.`);
        }
      }

      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles]);
      }
    },
    [files, maxFiles, onFilesChange]
  );

  /**
   * 드래그 앤 드롭 핸들러
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [disabled, handleFiles]
  );

  /**
   * 파일 입력 핸들러
   */
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        handleFiles(selectedFiles);
      }
      // 같은 파일을 다시 선택할 수 있도록 리셋
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  /**
   * 파일 삭제
   */
  const handleRemoveFile = useCallback(
    (id: string) => {
      const fileToRemove = files.find((f) => f.id === id);
      
      // 미리보기 URL 정리
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      onFilesChange(files.filter((f) => f.id !== id));
    },
    [files, onFilesChange]
  );

  /**
   * 업로드 버튼 클릭
   */
  const handleUploadClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-[#1A2C6D] bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-4">
          <Upload
            className={cn(
              'h-12 w-12',
              isDragging ? 'text-[#1A2C6D]' : 'text-gray-400'
            )}
          />
          <div>
            <p className="text-sm text-gray-600 mb-2">
              파일을 드래그하여 놓거나 버튼을 클릭하여 업로드하세요
            </p>
            <p className="text-xs text-gray-500">
              최대 {maxFiles}개, 각 파일 최대 {maxSizeMB}MB
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={disabled || files.length >= maxFiles}
          >
            <Upload className="h-4 w-4" />
            파일 선택
          </Button>
        </div>
      </div>

      {/* 업로드된 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            업로드된 파일 ({files.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {files.map((uploadedFile) => {
              const FileIconComponent = getFileIcon(uploadedFile.type);
              const isImage = uploadedFile.type.startsWith('image/');

              return (
                <div
                  key={uploadedFile.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {/* 이미지 미리보기 또는 아이콘 */}
                  {isImage && uploadedFile.preview ? (
                    <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100">
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                      <FileIconComponent className="h-6 w-6 text-gray-500" />
                    </div>
                  )}

                  {/* 파일 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>

                  {/* 삭제 버튼 */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(uploadedFile.id)}
                    disabled={disabled}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

