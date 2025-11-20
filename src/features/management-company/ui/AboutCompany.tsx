'use client';

import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { saveCompanyAboutField } from '../api/company-actions';
import { toast } from 'sonner';
import type { CompanyAbout, CompanyStrength, CompanyValue } from '@/src/entities/company/model/types';

interface AboutCompanyProps {
  initialData: CompanyAbout;
}

export default function AboutCompany({ initialData }: AboutCompanyProps) {
  const [aboutInfo, setAboutInfo] = useState<CompanyAbout>(initialData);
  const [savingFields, setSavingFields] = useState<Record<string, boolean>>({});

  const handleSaveField = async (field: 'introduction' | 'vision' | 'greetings' | 'mission' | 'strengths' | 'values', fieldName: string) => {
    try {
      setSavingFields({ ...savingFields, [field]: true });
      const value = aboutInfo[field];
      const result = await saveCompanyAboutField(field, value as string | CompanyStrength[] | CompanyValue[]);

      if (result.success) {
        toast.success(`${fieldName}이(가) 저장되었습니다.`);
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSavingFields({ ...savingFields, [field]: false });
    }
  };

  const addStrength = () => {
    setAboutInfo({
      ...aboutInfo,
      strengths: [
        ...aboutInfo.strengths,
        { id: `temp-${Date.now()}-${Math.random()}`, icon: '', title: '', description: '' },
      ],
    });
  };

  const removeStrength = (index: number) => {
    setAboutInfo({
      ...aboutInfo,
      strengths: aboutInfo.strengths.filter((_, i) => i !== index),
    });
  };

  const updateStrength = (index: number, field: keyof CompanyStrength, value: string) => {
    setAboutInfo({
      ...aboutInfo,
      strengths: aboutInfo.strengths.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    });
  };

  const addValue = () => {
    setAboutInfo({
      ...aboutInfo,
      values: [
        ...aboutInfo.values,
        { id: `temp-${Date.now()}-${Math.random()}`, title: '', description: '' },
      ],
    });
  };

  const removeValue = (index: number) => {
    setAboutInfo({
      ...aboutInfo,
      values: aboutInfo.values.filter((_, i) => i !== index),
    });
  };

  const updateValue = (index: number, field: keyof CompanyValue, value: string) => {
    setAboutInfo({
      ...aboutInfo,
      values: aboutInfo.values.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* 회사소개 카드 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">소개글</h3>
          <Button
            onClick={() => handleSaveField('introduction', '회사소개')}
            className="gap-2"
            disabled={savingFields.introduction}
          >
            <Save className="h-4 w-4" />
            {savingFields.introduction ? '저장 중...' : '저장'}
          </Button>
        </div>
        <DynamicCustomEditor
          text={aboutInfo.introduction}
          onChange={(value) => setAboutInfo({ ...aboutInfo, introduction: value })}
        />
      </Card>

      {/* 강점 카드 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 text-lg font-semibold">강점</h3>
          <Button
            onClick={() => handleSaveField('strengths', '강점')}
            className="gap-2"
            disabled={savingFields.strengths}
          >
            <Save className="h-4 w-4" />
            {savingFields.strengths ? '저장 중...' : '저장'}
          </Button>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 310px))' }}>
          {aboutInfo.strengths.map((strength, index) => (
            <Card key={strength.id || index} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-gray-500">강점 {index + 1}</span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeStrength(index)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>아이콘</Label>
                  <Input
                    value={strength.icon}
                    onChange={(e) => updateStrength(index, 'icon', e.target.value)}
                    placeholder="아이콘 이름 또는 URL"
                  />
                </div>
                <div>
                  <Label>제목</Label>
                  <Input
                    value={strength.title}
                    onChange={(e) => updateStrength(index, 'title', e.target.value)}
                    placeholder="강점 제목"
                  />
                </div>
                <div>
                  <Label>설명</Label>
                  <Textarea
                    value={strength.description}
                    onChange={(e) => updateStrength(index, 'description', e.target.value)}
                    placeholder="강점 설명"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          ))}
          {/* 강점 추가 카드 */}
          <button
            onClick={addStrength}
            className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 hover:bg-gray-50 transition-colors cursor-pointer min-h-[400px]"
          >
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <span className="text-gray-600 font-medium">강점 추가</span>
          </button>
        </div>
      </Card>

      {/* 비전 카드 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">비전</h3>
          <Button
            onClick={() => handleSaveField('vision', '비전')}
            className="gap-2"
            disabled={savingFields.vision}
          >
            <Save className="h-4 w-4" />
            {savingFields.vision ? '저장 중...' : '저장'}
          </Button>
        </div>
        <DynamicCustomEditor
          text={aboutInfo.vision}
          onChange={(value) => setAboutInfo({ ...aboutInfo, vision: value })}
        />
      </Card>

      {/* 핵심가치 카드 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">핵심가치</h3>
          <div className="flex gap-2">
            <Button onClick={addValue} variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              추가
            </Button>
            <Button
              onClick={() => handleSaveField('values', '핵심가치')}
              className="gap-2"
              disabled={savingFields.values}
            >
              <Save className="h-4 w-4" />
              {savingFields.values ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {aboutInfo.values.map((value, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-gray-500">핵심가치 {index + 1}</span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeValue(index)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>제목</Label>
                  <Input
                    value={value.title}
                    onChange={(e) => updateValue(index, 'title', e.target.value)}
                    placeholder="핵심가치 제목"
                  />
                </div>
                <div>
                  <Label>설명</Label>
                  <Textarea
                    value={value.description}
                    onChange={(e) => updateValue(index, 'description', e.target.value)}
                    placeholder="핵심가치 설명"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          ))}
          {aboutInfo.values.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              핵심가치가 없습니다. 위의 "추가" 버튼을 클릭하여 추가하세요.
            </div>
          )}
        </div>
      </Card>

      {/* 인사말 카드 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">인사말</h3>
          <Button
            onClick={() => handleSaveField('greetings', '인사말')}
            className="gap-2"
            disabled={savingFields.greetings}
          >
            <Save className="h-4 w-4" />
            {savingFields.greetings ? '저장 중...' : '저장'}
          </Button>
        </div>
        <DynamicCustomEditor
          text={aboutInfo.greetings}
          onChange={(value) => setAboutInfo({ ...aboutInfo, greetings: value })}
        />
      </Card>

      {/* 경영철학 카드 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">경영철학</h3>
          <Button
            onClick={() => handleSaveField('mission', '경영철학')}
            className="gap-2"
            disabled={savingFields.mission}
          >
            <Save className="h-4 w-4" />
            {savingFields.mission ? '저장 중...' : '저장'}
          </Button>
        </div>
        <DynamicCustomEditor
          text={aboutInfo.mission}
          onChange={(value) => setAboutInfo({ ...aboutInfo, mission: value })}
        />
      </Card>
    </div>
  );
}
