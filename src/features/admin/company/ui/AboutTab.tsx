'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/admin/editor';
import { supabase } from '@/src/shared/lib/supabase/client';
import { toast } from 'sonner';

interface AboutTabProps {
  initialContent: string;
}

export function AboutTab({ initialContent }: AboutTabProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);

      // 기존 정보 확인
      const { data: existingInfo, error: checkError } = await supabase
        .from('company_info')
        .select('id')
        .limit(1)
        .maybeSingle() as { data: { id: string } | null; error: any };

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116은 레코드가 없을 때 발생하는 에러 (무시)
        console.error('정보 확인 오류:', checkError);
        toast.error('저장 중 오류가 발생했습니다.');
        return;
      }

      if (existingInfo) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('company_info')
          .update({ about_content: content })
          .eq('id', existingInfo.id);

        if (updateError) {
          console.error('업데이트 오류:', updateError);
          toast.error(`저장 중 오류가 발생했습니다: ${updateError.message}`);
          return;
        }
      } else {
        // 새로 생성
        const { error: insertError } = await supabase
          .from('company_info')
          .insert({ about_content: content });

        if (insertError) {
          console.error('삽입 오류:', insertError);
          toast.error(`저장 중 오류가 발생했습니다: ${insertError.message}`);
          return;
        }
      }

      toast.success('회사소개 내용이 저장되었습니다.');
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
        <h3 className="text-gray-900 text-lg font-semibold">회사소개 내용</h3>
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

