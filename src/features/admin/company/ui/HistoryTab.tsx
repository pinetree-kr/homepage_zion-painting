'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { saveCompanyHistory } from '../api/company-actions';
import { toast } from 'sonner';
import type { CompanyHistory } from '@/src/entities';

interface HistoryTabProps {
  initialHistory: CompanyHistory[];
}

export function HistoryTab({ initialHistory }: HistoryTabProps) {
  const [history, setHistory] = useState<CompanyHistory[]>(initialHistory);
  const [saving, setSaving] = useState(false);

  const addHistoryItem = () => {
    const newItem: CompanyHistory = {
      id: `temp-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      month: '',
      content: '',
      display_order: history.length > 0 ? Math.max(...history.map(h => h.display_order)) + 1 : 1,
      created_at: null,
      updated_at: null,
    };
    setHistory([...history, newItem]);
  };

  const removeHistoryItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const updateHistoryItem = (id: string, field: keyof CompanyHistory, value: string) => {
    setHistory(history.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await saveCompanyHistory(history);

      if (result.success) {
        toast.success('연혁이 저장되었습니다.');
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
        <h3 className="text-gray-900 text-lg font-semibold">연혁 목록</h3>
        <div className="flex gap-2">
          <Button onClick={addHistoryItem} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            연혁 추가
          </Button>
          <Button onClick={handleSave} className="gap-2" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
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
  );
}

