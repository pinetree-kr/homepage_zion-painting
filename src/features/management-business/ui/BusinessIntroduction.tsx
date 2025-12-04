'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { toast } from 'sonner';
import { getBusinessInfo, saveBusinessInfo } from '../api/business-actions';

export default function BusinessIntroduction() {
  const [introduction, setIntroduction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const businessInfo = await getBusinessInfo();
      if (businessInfo) {
        setIntroduction(businessInfo.introduction || '');
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await saveBusinessInfo({ introduction });
      if (result.success) {
        toast.success('사업소개가 저장되었습니다.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <h3 className="text-gray-900 text-lg font-semibold">소개글</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicCustomEditor
            text={introduction}
            onChange={setIntroduction}
          />
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSave} className="h-[42px] gap-2" disabled={saving} size="lg">
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

