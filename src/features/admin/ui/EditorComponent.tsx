'use client';

import { useEffect, useRef, useState } from 'react';

interface EditorComponentProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  height?: string;
}

export function EditorComponent({ initialValue = '', onChange, height = '500px' }: EditorComponentProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = value.substring(start, end);
              const newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
              setValue(newText);
              onChange?.(newText);
              setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + 2, end + 2);
              }, 0);
            }
          }}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = value.substring(start, end);
              const newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
              setValue(newText);
              onChange?.(newText);
              setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + 1, end + 1);
              }, 0);
            }
          }}
        >
          <em>I</em>
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className="w-full p-4 border-0 resize-none focus:outline-none"
        style={{ height, minHeight: height }}
        placeholder="내용을 입력하세요..."
      />
    </div>
  );
}

