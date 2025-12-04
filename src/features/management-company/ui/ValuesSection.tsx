'use client';

import { useCallback, useMemo, useState, useEffect, Suspense } from 'react';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Input, Label, Textarea } from '@/src/shared/ui';
import { SortableValueItem } from './SortableValueItem';
import { generateId } from './utils';
import { fetchCompanyAboutField } from '../api/company-client';
import { saveCompanyAboutField } from '../api/company-actions';
import { toast } from 'sonner';
import { SkeletonValuesSection } from './SkeletonSection';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { CompanyValue } from '@/src/entities/company/model/types';

function ValuesSectionContent() {
  const [values, setValues] = useState<CompanyValue[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCompanyAboutField('values');
        // ID가 없는 항목들에 ID 부여
        const normalizedData = data.map((value) => ({
          ...value,
          id: value.id || generateId(),
        }));
        setValues(normalizedData);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const valueIds = useMemo(() => values.map((v) => v.id), [values]);

  const addValue = useCallback(() => {
    setValues((prev) => [
      ...prev,
      { id: generateId(), title: '', description: '' },
    ]);
  }, []);

  const removeValue = useCallback((id: string) => {
    setValues((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateValue = useCallback((id: string, field: keyof CompanyValue, value: string) => {
    setValues((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setValues((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const result = await saveCompanyAboutField('values', values);

      if (result.success) {
        toast.success('핵심가치가 저장되었습니다.');
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  }, [values]);

  if (loading) {
    return <SkeletonValuesSection />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <h3 className="text-gray-900 text-lg font-semibold">핵심가치</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>

        {isMounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={valueIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {values.map((value) => (
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
        ) : (
          <div className="space-y-4">
            {values.map((value) => (
              <div
                key={value.id || `temp-${value.title}`}
                className="flex gap-4 items-start p-4 border rounded-lg bg-white border-gray-200"
              >
                <div className="flex flex-col items-center gap-2 mt-2">
                  <div className="h-5 w-5 text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div>
                    <Label>제목</Label>
                    <Input
                      value={value.title}
                      onChange={(e) => updateValue(value.id, 'title', e.target.value)}
                      placeholder="핵심가치 제목"
                    />
                  </div>
                  <div>
                    <Label>설명</Label>
                    <Textarea
                      value={value.description}
                      onChange={(e) => updateValue(value.id, 'description', e.target.value)}
                      placeholder="핵심가치 설명"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex items-start pt-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeValue(value.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

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

export function ValuesSection() {
  return (
    <Suspense fallback={<SkeletonValuesSection />}>
      <ValuesSectionContent />
    </Suspense>
  );
}
