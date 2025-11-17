'use client';

import { useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import {
  ClassicEditor, Essentials, Paragraph, Bold, Italic, FontColor, FontSize,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  LinkImage,
  ImageUpload,
  ImageInsert,
  ImageInsertViaUrl
} from 'ckeditor5';
// import "@ckeditor/ckeditor5-image";
import 'ckeditor5/ckeditor5.css';
import './style.css';
import { SupabaseUploadAdapterPlugin } from './SupabaseUploadAdapter';

interface CustomEditorProps {
  text?: string;
  onChange?: (value: string) => void;
  /**
   * Supabase Storage 버킷 이름
   * @default 'editor-images'
   */
  uploadBucket?: string;
  /**
   * 업로드할 폴더 경로
   * @default 'uploads'
   */
  uploadFolder?: string;
}

export function CustomEditor({ 
  text = '', 
  onChange,
  uploadBucket = 'editor-images',
  uploadFolder = 'uploads'
}: CustomEditorProps) {
  const editorRef = useRef<any>(null);

  const handleChange = (_event: unknown, editor: any) => {
    const data = editor.getData();
    onChange?.(data);
  };

  const handleReady = (editor: any) => {
    editorRef.current = editor;
    // 커스텀 업로드 어댑터 등록
    SupabaseUploadAdapterPlugin(editor, uploadBucket, uploadFolder);
  };

  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        licenseKey: 'GPL',
        language: 'ko',
        plugins: [
          Essentials,
          Paragraph,
          Bold,
          Italic,
          FontColor,
          FontSize,
          Image,
          ImageUpload,
          ImageInsert,
          ImageInsertViaUrl,
          ImageToolbar,
          ImageCaption,
          ImageStyle,
          ImageResize,
          LinkImage
        ],
        toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'fontColor', 'fontSize', '|', 'insertImage'],
        image: {
          toolbar: ['toggleImageCaption', 'imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'resizeImage'],
          insert: {
            integrations: ['upload', 'url'],
          },
        },
      }}
      data={text ?? '<p>여기에 글을 작성합니다.</p>'}
      onChange={handleChange}
      onReady={handleReady}
    />
  );
}

