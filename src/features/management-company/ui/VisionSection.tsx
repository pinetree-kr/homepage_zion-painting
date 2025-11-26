'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Save } from 'lucide-react';
import { Button, Card } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { fetchCompanyAboutField } from '../api/company-client';
import { saveCompanyAboutField } from '../api/company-actions';
import { toast } from 'sonner';
import { SkeletonSection } from './SkeletonSection';

function VisionSectionContent() {
  const [value, setValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCompanyAboutField('vision');
        setValue(data);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const result = await saveCompanyAboutField('vision', value);

      if (result.success) {
        toast.success('비전이 저장되었습니다.');
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  }, [value]);

  if (loading) {
    return <SkeletonSection title="비전" height="h-64" />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">비전</h3>
        </div>
        <DynamicCustomEditor
          text={value}
          onChange={setValue}
        />
      </Card>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="gap-2"
          disabled={saving}
          size="lg"
        >
          <Save className="h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}

export function VisionSection() {
  return (
    <Suspense fallback={<SkeletonSection title="비전" height="h-64" />}>
      <VisionSectionContent />
    </Suspense>
  );
}

