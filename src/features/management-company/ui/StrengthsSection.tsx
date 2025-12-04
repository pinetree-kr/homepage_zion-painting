'use client';

import { useCallback, useMemo, useState, useEffect, Suspense } from 'react';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Input, Label, Textarea } from '@/src/shared/ui';
import { IconSelector } from './IconSelector';
import { SortableStrengthItem } from './SortableStrengthItem';
import { generateId } from './utils';
import { fetchCompanyAboutField } from '../api/company-client';
import { saveCompanyAboutField } from '../api/company-actions';
import { toast } from 'sonner';
import { SkeletonStrengthsSection } from './SkeletonSection';
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { CompanyStrength } from '@/src/entities/company/model/types';

function StrengthsSectionContent() {
  const [strengths, setStrengths] = useState<CompanyStrength[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCompanyAboutField('strengths');
        // ID가 없는 항목들에 ID 부여
        const normalizedData = data.map((strength) => ({
          ...strength,
          id: strength.id || generateId(),
        }));
        setStrengths(normalizedData);
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

  const strengthIds = useMemo(() => strengths.map((s) => s.id), [strengths]);

  const addStrength = useCallback(() => {
    setStrengths((prev) => [
      ...prev,
      { id: generateId(), icon: '', title: '', description: '' },
    ]);
  }, []);

  const removeStrength = useCallback((id: string) => {
    setStrengths((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateStrength = useCallback((id: string, field: keyof CompanyStrength, value: string) => {
    setStrengths((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStrengths((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const result = await saveCompanyAboutField('strengths', strengths);

      if (result.success) {
        toast.success('강점이 저장되었습니다.');
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  }, [strengths]);

  if (loading) {
    return <SkeletonStrengthsSection />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <h3 className="text-gray-900 text-lg font-semibold">강점</h3>
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
              items={strengthIds}
              strategy={horizontalListSortingStrategy}
            >
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 310px))' }}>
                {strengths.map((strength) => (
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
                  className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 hover:bg-gray-50 transition-colors cursor-pointer min-h-[300px]"
                >
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="h-12 w-12 text-gray-400" />
                  </div>
                  <span className="text-gray-600 font-medium">강점 추가</span>
                </button>
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 310px))' }}>
            {strengths.map((strength) => (
              <Card key={strength.id || `temp-${strength.title}`} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm text-gray-500">강점</span>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeStrength(strength.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <IconSelector
                    value={strength.icon}
                    onChange={(iconName) => updateStrength(strength.id, 'icon', iconName)}
                  />
                  <div>
                    <Label>제목</Label>
                    <Input
                      value={strength.title}
                      onChange={(e) => updateStrength(strength.id, 'title', e.target.value)}
                      placeholder="강점 제목"
                    />
                  </div>
                  <div>
                    <Label>설명</Label>
                    <Textarea
                      value={strength.description}
                      onChange={(e) => updateStrength(strength.id, 'description', e.target.value)}
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
        )}
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

export function StrengthsSection() {
  return (
    <Suspense fallback={<SkeletonStrengthsSection />}>
      <StrengthsSectionContent />
    </Suspense>
  );
}
