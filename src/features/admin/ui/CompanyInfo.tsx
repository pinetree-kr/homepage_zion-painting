'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/shared/ui';
import DynamicCustomEditor from './DynamicCustomEditor';
import { toast } from 'sonner';
import { HistoryItem } from '@/src/entities';
import { supabase } from '@/src/shared/lib';
import type { CompanyHistory, CompanyInfo } from '@/src/shared/lib/supabase-types';

export default function CompanyInfo() {
  const [aboutContent, setAboutContent] = useState('');
  const [organizationContent, setOrganizationContent] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 데이터 로드
  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);

      // 회사 정보 로드
      const { data: companyInfo, error: companyError } = await supabase
        .from('company_info')
        .select('*')
        .limit(1)
        .maybeSingle() as { data: CompanyInfo | null; error: any };

      if (companyError) {
        console.error('회사 정보 로드 오류:', companyError);
        toast.error('회사 정보를 불러오는 중 오류가 발생했습니다.');
      } else if (companyInfo) {
        setAboutContent(companyInfo.about_content || '');
        setOrganizationContent(companyInfo.organization_content || '');
      }

      // 연혁 로드
      const { data: historyData, error: historyError } = await supabase
        .from('company_history')
        .select('*')
        .order('display_order', { ascending: true });

      if (historyError) {
        console.error('연혁 로드 오류:', historyError);
        toast.error('연혁을 불러오는 중 오류가 발생했습니다.');
      } else if (historyData) {
        const historyItems: HistoryItem[] = historyData.map((item: CompanyHistory) => ({
          id: item.id,
          year: item.year,
          month: item.month || '',
          content: item.content,
          order: item.display_order,
        }));
        setHistory(historyItems);
      }
    } catch (error) {
      console.error('데이터 로드 중 예외 발생:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addHistoryItem = () => {
    const newItem: HistoryItem = {
      id: `temp-${Date.now()}`, // 임시 ID
      year: new Date().getFullYear().toString(),
      month: '',
      content: '',
      order: history.length > 0 ? Math.max(...history.map(h => h.order)) + 1 : 1,
    };
    setHistory([...history, newItem]);
  };

  const removeHistoryItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const updateHistoryItem = (id: string, field: keyof HistoryItem, value: string) => {
    setHistory(history.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 회사 정보 저장 또는 업데이트
      const { data: existingInfo } = await supabase
        .from('company_info')
        .select('id')
        .limit(1)
        .maybeSingle() as { data: { id: string } | null; error: any };

      if (existingInfo) {
        // 업데이트
        const { error: updateError } = await (supabase as any)
          .from('company_info')
          .update({
            about_content: aboutContent,
            organization_content: organizationContent,
          })
          .eq('id', existingInfo.id);

        if (updateError) throw updateError;
      } else {
        // 새로 생성
        const { error: insertError } = await (supabase as any)
          .from('company_info')
          .insert({
            about_content: aboutContent,
            organization_content: organizationContent,
          });

        if (insertError) throw insertError;
      }

      // 연혁 저장
      // 기존 연혁 ID 목록 가져오기
      const { data: existingHistory } = await supabase
        .from('company_history')
        .select('id');

      // 기존 연혁 삭제
      if (existingHistory && existingHistory.length > 0) {
        const existingIds = existingHistory.map((h: any) => h.id);
        const { error: deleteError } = await supabase
          .from('company_history')
          .delete()
          .in('id', existingIds);

        if (deleteError) throw deleteError;
      }

      // 새 연혁 추가
      if (history.length > 0) {
        const historyToInsert = history.map((item, index) => ({
          year: item.year,
          month: item.month || null,
          content: item.content,
          display_order: item.order || index + 1,
        }));

        const { error: insertHistoryError } = await (supabase as any)
          .from('company_history')
          .insert(historyToInsert);

        if (insertHistoryError) throw insertHistoryError;
      }

      toast.success('회사 정보가 저장되었습니다.');
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">회사소개 관리</h2>
          <p className="text-gray-500 text-sm mt-1">회사소개, 연혁, 조직도를 관리합니다</p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={loading || saving}>
          <Save className="h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">회사소개</TabsTrigger>
          <TabsTrigger value="history">연혁</TabsTrigger>
          <TabsTrigger value="organization">조직도</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4 text-lg font-semibold">회사소개 내용</h3>
            <DynamicCustomEditor
              text={aboutContent}
              onChange={setAboutContent}
            />
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 text-lg font-semibold">연혁 관리</h3>
              <Button onClick={addHistoryItem} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                연혁 추가
              </Button>
            </div>

            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-white">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move mt-2" />
                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <Label>연도</Label>
                      <Input
                        value={item.year}
                        onChange={(e) => updateHistoryItem(item.id, 'year', e.target.value)}
                        placeholder="2024"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>월</Label>
                      <Input
                        value={item.month || ''}
                        onChange={(e) => updateHistoryItem(item.id, 'month', e.target.value)}
                        placeholder="01"
                      />
                    </div>
                    <div className="col-span-7">
                      <Label>내용</Label>
                      <Input
                        value={item.content}
                        onChange={(e) => updateHistoryItem(item.id, 'content', e.target.value)}
                        placeholder="회사 설립"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeHistoryItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4 text-lg font-semibold">조직도</h3>
            {/* <CustomEditor
              initialValue={organizationContent}
              onChange={setOrganizationContent}
            /> */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

