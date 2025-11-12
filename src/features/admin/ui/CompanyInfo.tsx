'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/shared/ui';
import { EditorComponent } from './EditorComponent';
import { toast } from 'sonner';
import { HistoryItem } from '@/src/entities';

export default function CompanyInfo() {
  const [aboutContent, setAboutContent] = useState('');
  const [organizationContent, setOrganizationContent] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', year: '2024', month: '01', content: '회사 설립', order: 1 },
  ]);

  const addHistoryItem = () => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      year: new Date().getFullYear().toString(),
      month: '',
      content: '',
      order: history.length + 1,
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

  const handleSave = () => {
    toast.success('회사 정보가 저장되었습니다.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">회사소개 관리</h2>
          <p className="text-gray-500 text-sm mt-1">회사소개, 연혁, 조직도를 관리합니다</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          저장
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
            <EditorComponent 
              initialValue={aboutContent}
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
            <EditorComponent 
              initialValue={organizationContent}
              onChange={setOrganizationContent}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

