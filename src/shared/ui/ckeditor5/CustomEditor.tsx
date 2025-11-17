'use client';

import { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import { ClassicEditor, Essentials, Paragraph, Bold, Italic, Image, FontColor, FontSize } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import './style.css';

interface CustomEditorProps {
  text?: string;
  onChange?: (value: string) => void;
}

export function CustomEditor({ text = '', onChange }: CustomEditorProps) {
  // const [editorData, setEditorData] = useState(text);

  // useEffect(() => {
  //   // setEditorData(text);
  // }, [text]);

  const handleChange = (_event: unknown, editor: any) => {
    const data = editor.getData();
    // setEditorData(data);
    onChange?.(data);
  };

  return (
    // <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ minHeight: height }}>
    <CKEditor
      editor={ClassicEditor}
      config={{
        licenseKey: 'GPL',
        language: 'ko',
        plugins: [Essentials, Paragraph, Bold, Italic, Image, FontColor, FontSize],
        toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'fontColor', 'fontSize', '|', 'image',],
        initialData: text ?? '<p>여기에 글을 작성합니다.</p>',
      }}
      data={text}
      onChange={handleChange}
    />
    // </div>
  );
}

