'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { saveCompanyAboutField } from '../api/company-actions';
import { IconSelector } from './IconSelector';
import { toast } from 'sonner';
import type { CompanyAbout, CompanyStrength, CompanyValue } from '@/src/entities/company/model/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AboutCompanyProps {
  initialData: CompanyAbout;
}

// SortableStrengthItem 컴포넌트
function SortableStrengthItem({
  strength,
  onUpdate,
  onRemove,
}: {
  strength: CompanyStrength;
  onUpdate: (id: string, field: keyof CompanyStrength, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: strength.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${isDragging ? 'border-blue-500 shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          {...attributes}
          {...listeners}
          className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onRemove(strength.id)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <IconSelector
          value={strength.icon}
          onChange={(iconName) => onUpdate(strength.id, 'icon', iconName)}
        />
        <div>
          <Label>제목</Label>
          <Input
            value={strength.title}
            onChange={(e) => onUpdate(strength.id, 'title', e.target.value)}
            placeholder="강점 제목"
          />
        </div>
        <div>
          <Label>설명</Label>
          <Textarea
            value={strength.description}
            onChange={(e) => onUpdate(strength.id, 'description', e.target.value)}
            placeholder="강점 설명"
            rows={3}
          />
        </div>
      </div>
    </Card>
  );
}

// SortableValueItem 컴포넌트
function SortableValueItem({
  value,
  onUpdate,
  onRemove,
}: {
  value: CompanyValue;
  onUpdate: (id: string, field: keyof CompanyValue, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-4 items-start p-4 border rounded-lg bg-white ${isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'
        }`}
    >
      <div className="flex flex-col items-center gap-2 mt-2">
        <div
          {...attributes}
          {...listeners}
          className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <Label>제목</Label>
          <Input
            value={value.title}
            onChange={(e) => onUpdate(value.id, 'title', e.target.value)}
            placeholder="핵심가치 제목"
          />
        </div>
        <div>
          <Label>설명</Label>
          <Textarea
            value={value.description}
            onChange={(e) => onUpdate(value.id, 'description', e.target.value)}
            placeholder="핵심가치 설명"
            rows={3}
          />
        </div>
      </div>
      <div className="flex items-start pt-2">
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onRemove(value.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
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
        { id: '', icon: '', title: '', description: '' },
      ],
    });
  };

  const removeStrength = (id: string) => {
    setAboutInfo({
      ...aboutInfo,
      strengths: aboutInfo.strengths.filter((item) => item.id !== id),
    });
  };

  const updateStrength = (id: string, field: keyof CompanyStrength, value: string) => {
    setAboutInfo({
      ...aboutInfo,
      strengths: aboutInfo.strengths.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleStrengthDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAboutInfo({
        ...aboutInfo,
        strengths: (() => {
          const oldIndex = aboutInfo.strengths.findIndex((item) => item.id === active.id);
          const newIndex = aboutInfo.strengths.findIndex((item) => item.id === over.id);

          return arrayMove(aboutInfo.strengths, oldIndex, newIndex);
        })(),
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addValue = () => {
    setAboutInfo({
      ...aboutInfo,
      values: [
        ...aboutInfo.values,
        { id: '', title: '', description: '' },
      ],
    });
  };

  const removeValue = (id: string) => {
    setAboutInfo({
      ...aboutInfo,
      values: aboutInfo.values.filter((item) => item.id !== id),
    });
  };

  const updateValue = (id: string, field: keyof CompanyValue, value: string) => {
    setAboutInfo({
      ...aboutInfo,
      values: aboutInfo.values.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleValueDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAboutInfo({
        ...aboutInfo,
        values: (() => {
          const oldIndex = aboutInfo.values.findIndex((item) => item.id === active.id);
          const newIndex = aboutInfo.values.findIndex((item) => item.id === over.id);

          return arrayMove(aboutInfo.values, oldIndex, newIndex);
        })(),
      });
    }
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleStrengthDragEnd}
        >
          <SortableContext
            items={aboutInfo.strengths.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 310px))' }}>
              {aboutInfo.strengths.map((strength) => (
                <SortableStrengthItem
                  key={strength.id}
                  strength={strength}
                  onUpdate={updateStrength}
                  onRemove={removeStrength}
                />
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
          </SortableContext>
        </DndContext>
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
          <Button
            onClick={() => handleSaveField('values', '핵심가치')}
            className="gap-2"
            disabled={savingFields.values}
          >
            <Save className="h-4 w-4" />
            {savingFields.values ? '저장 중...' : '저장'}
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleValueDragEnd}
        >
          <SortableContext
            items={aboutInfo.values.map((v) => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {aboutInfo.values.map((value) => (
                <SortableValueItem
                  key={value.id}
                  value={value}
                  onUpdate={updateValue}
                  onRemove={removeValue}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* 핵심가치 추가 영역 - 하단에 큰 영역으로 표시 */}
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer mt-4 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          onClick={addValue}
        >
          <Plus className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-500">
            새 핵심가치 추가
          </p>
          <p className="text-xs mt-1 text-gray-400">
            클릭하여 새로운 핵심가치를 추가하세요
          </p>
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
