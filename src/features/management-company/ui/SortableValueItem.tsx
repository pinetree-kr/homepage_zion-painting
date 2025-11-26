'use client';

import { useCallback, memo } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Button, Input, Label, Textarea } from '@/src/shared/ui';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CompanyValue } from '@/src/entities/company/model/types';

interface SortableValueItemProps {
  value: CompanyValue;
  onUpdate: (id: string, field: keyof CompanyValue, value: string) => void;
  onRemove: (id: string) => void;
}

export const SortableValueItem = memo(function SortableValueItem({
  value,
  onUpdate,
  onRemove,
}: SortableValueItemProps) {
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

  const handleRemove = useCallback(() => {
    onRemove(value.id);
  }, [onRemove, value.id]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(value.id, 'title', e.target.value);
  }, [onUpdate, value.id]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(value.id, 'description', e.target.value);
  }, [onUpdate, value.id]);

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
            onChange={handleTitleChange}
            placeholder="핵심가치 제목"
          />
        </div>
        <div>
          <Label>설명</Label>
          <Textarea
            value={value.description}
            onChange={handleDescriptionChange}
            placeholder="핵심가치 설명"
            rows={3}
          />
        </div>
      </div>
      <div className="flex items-start pt-2">
        <Button
          variant="destructive"
          size="icon"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

