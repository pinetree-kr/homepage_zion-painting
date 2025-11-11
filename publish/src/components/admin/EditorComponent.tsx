import { useEffect, useRef } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';

interface EditorComponentProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  height?: string;
}

export function EditorComponent({ initialValue = '', onChange, height = '500px' }: EditorComponentProps) {
  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    if (editorRef.current && initialValue) {
      const editorInstance = editorRef.current.getInstance();
      editorInstance.setMarkdown(initialValue);
    }
  }, [initialValue]);

  const handleChange = () => {
    if (editorRef.current && onChange) {
      const editorInstance = editorRef.current.getInstance();
      const markdown = editorInstance.getMarkdown();
      onChange(markdown);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Editor
        ref={editorRef}
        initialValue={initialValue}
        previewStyle="vertical"
        height={height}
        initialEditType="wysiwyg"
        useCommandShortcut={true}
        onChange={handleChange}
        toolbarItems={[
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          ['table', 'link', 'image'],
          ['code', 'codeblock'],
        ]}
      />
    </div>
  );
}
