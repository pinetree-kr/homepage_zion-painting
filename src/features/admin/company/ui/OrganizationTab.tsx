'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import DynamicCustomEditor from '../../ui/DynamicCustomEditor';
import { saveOrganizationContent } from '../api/company-actions';
import { toast } from 'sonner';

interface OrganizationTabProps {
  initialContent: string;
}

export function OrganizationTab({ initialContent }: OrganizationTabProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await saveOrganizationContent(content);
      
      if (result.success) {
        toast.success('조직도가 저장되었습니다.');
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 text-lg font-semibold">조직도</h3>
        <Button onClick={handleSave} className="gap-2" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>
      <DynamicCustomEditor
        text={content}
        onChange={setContent}
      />
    </Card>
  );
}

