'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical, Briefcase, Award } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/shared/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui';
import { saveCompanyHistory } from '../api/company-actions';
import { toast } from 'sonner';
import type { CompanyHistory, CompanyHistoryType } from '@/src/entities';
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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CompanyHistoriesProps {
  items: CompanyHistory[];
}

// SortableItem 컴포넌트
function SortableHistoryItem({
  item,
  onUpdate,
  onRemove,
  getTypeIcon,
}: {
  item: CompanyHistory;
  onUpdate: (id: string, field: keyof CompanyHistory, value: string | CompanyHistoryType) => void;
  onRemove: (id: string) => void;
  getTypeIcon: (type: CompanyHistoryType) => React.ReactElement;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-4 items-start p-4 border rounded-lg bg-white ${
        isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'
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
        {getTypeIcon(item.type)}
      </div>
      <div className="flex-1 grid grid-cols-12 gap-4">
        <div className="col-span-2">
          <Label>타입</Label>
          <Select
            value={item.type}
            onValueChange={(value) => onUpdate(item.id, 'type', value as CompanyHistoryType)}
          >
            <SelectTrigger>
              <SelectValue>
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <span>{item.type === 'biz' ? '사업' : '인증/허가'}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="biz">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>사업</span>
                </div>
              </SelectItem>
              <SelectItem value="cert">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>인증/허가</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label>연도</Label>
          <Input
            value={item.year}
            onChange={(e) => onUpdate(item.id, 'year', e.target.value)}
            placeholder="2024"
          />
        </div>
        <div className="col-span-2">
          <Label>월</Label>
          <Input
            value={item.month || ''}
            onChange={(e) => onUpdate(item.id, 'month', e.target.value)}
            placeholder="01"
          />
        </div>
        <div className="col-span-5">
          <Label>내용</Label>
          <Input
            value={item.content}
            onChange={(e) => onUpdate(item.id, 'content', e.target.value)}
            placeholder="회사 설립"
          />
        </div>
        <div className="col-span-1 flex items-end">
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyHistories({ items }: CompanyHistoriesProps) {
  const [histories, setHistories] = useState<CompanyHistory[]>(items);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addHistoryItem = () => {
    const newItem: CompanyHistory = {
      id: `temp-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      month: '',
      content: '',
      type: 'biz',
      display_order: histories.length > 0 ? Math.max(...histories.map(h => h.display_order)) + 1 : 1,
      created_at: null,
      updated_at: null,
    };
    setHistories([...histories, newItem]);
  };

  const removeHistoryItem = (id: string) => {
    setHistories(histories.filter(item => item.id !== id));
  };

  const updateHistoryItem = (id: string, field: keyof CompanyHistory, value: string | CompanyHistoryType) => {
    setHistories(histories.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getTypeIcon = (type: CompanyHistoryType) => {
    return type === 'biz' ? (
      <Briefcase className="h-4 w-4 text-blue-600" />
    ) : (
      <Award className="h-4 w-4 text-amber-600" />
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setHistories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // display_order 업데이트
        return newItems.map((item, index) => ({
          ...item,
          display_order: index + 1,
        }));
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await saveCompanyHistory(histories);

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-gray-900 text-lg font-semibold">연혁 목록</span>
          </CardTitle>
        </CardHeader>
        <CardContent>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={histories.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {histories.map((item) => (
                <SortableHistoryItem
                  key={item.id}
                  item={item}
                  onUpdate={updateHistoryItem}
                  onRemove={removeHistoryItem}
                  getTypeIcon={getTypeIcon}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* 연혁 추가 영역 - 하단에 큰 영역으로 표시 */}
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer mt-4 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          onClick={addHistoryItem}
        >
          <Plus className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-500">
            새 연혁 추가
          </p>
          <p className="text-xs mt-1 text-gray-400">
            클릭하여 새로운 연혁을 추가하세요
          </p>
        </div>
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

