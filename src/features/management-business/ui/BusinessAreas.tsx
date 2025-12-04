'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/shared/ui';
import { IconSelector } from '@/src/features/management-company/ui/IconSelector';
import { toast } from 'sonner';
import { BusinessArea } from '@/src/entities';
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getBusinessInfo, saveBusinessInfo } from '../api/business-actions';

function generateId() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  if (typeof window !== 'undefined') {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  return '';
}

// SortableBusinessAreaItem 컴포넌트
const SortableBusinessAreaItem = memo(function SortableBusinessAreaItem({
  area,
  onUpdate,
  onRemove,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature,
}: {
  area: BusinessArea;
  onUpdate: (id: string, field: keyof BusinessArea, value: any) => void;
  onRemove: (id: string) => void;
  onAddFeature: (areaId: string) => void;
  onUpdateFeature: (areaId: string, index: number, value: string) => void;
  onRemoveFeature: (areaId: string, index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: area.id! });

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
          onClick={() => onRemove(area.id!)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="mr-4">
            <Label>사업분야명</Label>
            <Input
              value={area.title}
              onChange={(e) => onUpdate(area.id!, 'title', e.target.value)}
              placeholder="도장설비"
            />
          </div>
          <IconSelector
            className="ml-2 min-w-[90px]"
            value={area.icon || ''}
            onChange={(iconName) => onUpdate(area.id!, 'icon', iconName)}
          />
        </div>
        <div>
          <Label>설명</Label>
          <Textarea
            value={area.description}
            onChange={(e) => onUpdate(area.id!, 'description', e.target.value)}
            placeholder="최첨단 도장설비 제공"
            rows={3}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>주요 특징</Label>
            <Button
              onClick={() => onAddFeature(area.id!)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-3 w-3" />
              특징 추가
            </Button>
          </div>
          <div className="space-y-2">
            {(area.features || []).map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => onUpdateFeature(area.id!, index, e.target.value)}
                  placeholder="특징 입력"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveFeature(area.id!, index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
});

export default function BusinessAreas({ items }: { items: BusinessArea[] }) {
  const [businessAreas, setBusinessAreas] = useState<BusinessArea[]>([]);
  const [saving, setSaving] = useState(false);

  // ID 정규화
  useEffect(() => {
    const hasMissingIds = items.some((a) => !a.id);

    if (hasMissingIds) {
      const normalizedAreas = items.map((area) => ({
        ...area,
        id: area.id || generateId(),
      }));
      setBusinessAreas(normalizedAreas);
    } else {
      setBusinessAreas(items);
    }
  }, [items, setBusinessAreas]);


  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const result = await saveBusinessInfo({ areas: businessAreas });
      if (result.success) {
        toast.success('사업분야가 저장되었습니다.');
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  }, [businessAreas]);

  const addBusinessArea = useCallback(() => {
    setBusinessAreas((prevAreas) => {
      const newArea: BusinessArea = {
        id: generateId(),
        title: '',
        description: '',
        icon: '',
        features: [],
        display_order: prevAreas.length + 1,
      };
      return [...prevAreas, newArea];
    });
  }, []);

  const removeBusinessArea = useCallback((id: string) => {
    setBusinessAreas((prevAreas) => prevAreas.filter(area => area.id !== id));
  }, []);

  const updateBusinessArea = useCallback((id: string, field: keyof BusinessArea, value: any) => {
    setBusinessAreas((prevAreas) =>
      prevAreas.map(area =>
        area.id === id ? { ...area, [field]: value } : area
      )
    );
  }, []);

  const addFeature = useCallback((areaId: string) => {
    setBusinessAreas((prevAreas) =>
      prevAreas.map(area =>
        area.id === areaId ? { ...area, features: [...(area.features || []), ''] } : area
      )
    );
  }, []);

  const updateFeature = useCallback((areaId: string, index: number, value: string) => {
    setBusinessAreas((prevAreas) =>
      prevAreas.map(area =>
        area.id === areaId
          ? { ...area, features: (area.features || []).map((f, i) => i === index ? value : f) }
          : area
      )
    );
  }, []);

  const removeFeature = useCallback((areaId: string, index: number) => {
    setBusinessAreas((prevAreas) =>
      prevAreas.map(area =>
        area.id === areaId
          ? { ...area, features: (area.features || []).filter((_, i) => i !== index) }
          : area
      )
    );
  }, []);

  const handleAreaDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBusinessAreas((prevAreas) => {
        const oldIndex = prevAreas.findIndex((item) => item.id === active.id);
        const newIndex = prevAreas.findIndex((item) => item.id === over.id);
        return arrayMove(prevAreas, oldIndex, newIndex).map((area, index) => ({
          ...area,
          display_order: index + 1,
        }));
      });
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center py-12">
  //       <p className="text-gray-500">로딩 중...</p>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <h3 className="text-gray-900 text-lg font-semibold">사업분야 목록</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
      {businessAreas.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleAreaDragEnd}
        >
          <SortableContext
            items={businessAreas.map((a) => a.id!).filter(Boolean)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 310px))' }}>
              {businessAreas.map((area) => (
                <SortableBusinessAreaItem
                  key={area.id}
                  area={area}
                  onUpdate={updateBusinessArea}
                  onRemove={removeBusinessArea}
                  onAddFeature={addFeature}
                  onUpdateFeature={updateFeature}
                  onRemoveFeature={removeFeature}
                />
              ))}
              {/* 사업분야 추가 카드 */}
              <button
                onClick={addBusinessArea}
                className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 hover:bg-gray-50 transition-colors cursor-pointer min-h-[400px]"
              >
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="h-12 w-12 text-gray-400" />
                </div>
                <span className="text-gray-600 font-medium">사업분야 추가</span>
              </button>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 310px))' }}>
          {businessAreas.map((area) => (
            <Card key={area.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-gray-500">사업분야</span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeBusinessArea(area.id!)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <IconSelector
                  value={area.icon || ''}
                  onChange={(iconName) => updateBusinessArea(area.id!, 'icon', iconName)}
                />
                <div>
                  <Label>사업분야명</Label>
                  <Input
                    value={area.title}
                    onChange={(e) => updateBusinessArea(area.id!, 'title', e.target.value)}
                    placeholder="도장설비"
                  />
                </div>
                <div>
                  <Label>설명</Label>
                  <Textarea
                    value={area.description}
                    onChange={(e) => updateBusinessArea(area.id!, 'description', e.target.value)}
                    placeholder="최첨단 도장설비 제공"
                    rows={3}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>주요 특징</Label>
                    <Button
                      onClick={() => addFeature(area.id!)}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      특징 추가
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(area.features || []).map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(area.id!, index, e.target.value)}
                          placeholder="특징 입력"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeature(area.id!, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {/* 사업분야 추가 카드 */}
          <button
            onClick={addBusinessArea}
            className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 hover:bg-gray-50 transition-colors cursor-pointer min-h-[400px]"
          >
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <span className="text-gray-600 font-medium">사업분야 추가</span>
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

