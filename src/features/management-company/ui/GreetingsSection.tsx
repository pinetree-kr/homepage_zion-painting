'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Save } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { fetchCompanyAboutField } from '../api/company-client';
import { saveCompanyAboutField } from '../api/company-actions';
import { toast } from 'sonner';
import { SkeletonSection } from './SkeletonSection';

function GreetingsSectionContent() {
  const [value, setValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCompanyAboutField('greetings');
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
      const result = await saveCompanyAboutField('greetings', value);

      if (result.success) {
        toast.success('인사말이 저장되었습니다.');
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
    return <SkeletonSection title="인사말" height="h-64" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <h3 className="text-gray-900 text-lg font-semibold">인사말</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicCustomEditor
            text={value}
            onChange={setValue}
          />
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            onClick={handleSave}
            className="h-[42px] gap-2"
            disabled={saving}
            size="lg"
          >
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export function GreetingsSection() {
  return (
    <Suspense fallback={<SkeletonSection title="인사말" height="h-64" />}>
      <GreetingsSectionContent />
    </Suspense>
  );
}

