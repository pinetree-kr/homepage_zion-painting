'use client';

import { useCallback, memo } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Button, Card, Input, Label, Textarea } from '@/src/shared/ui';
import { IconSelector } from './IconSelector';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CompanyStrength } from '@/src/entities/company/model/types';

interface SortableStrengthItemProps {
  strength: CompanyStrength;
  onUpdate: (id: string, field: keyof CompanyStrength, value: string) => void;
  onRemove: (id: string) => void;
}

export const SortableStrengthItem = memo(function SortableStrengthItem({
  strength,
  onUpdate,
  onRemove,
}: SortableStrengthItemProps) {
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

  const handleRemove = useCallback(() => {
    onRemove(strength.id);
  }, [onRemove, strength.id]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(strength.id, 'title', e.target.value);
  }, [onUpdate, strength.id]);

  const handleIconChange = useCallback((iconName: string) => {
    onUpdate(strength.id, 'icon', iconName);
  }, [onUpdate, strength.id]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(strength.id, 'description', e.target.value);
  }, [onUpdate, strength.id]);

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
          onClick={handleRemove}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="mr-4">
            <Label>제목</Label>
            <Input
              value={strength.title}
              onChange={handleTitleChange}
              placeholder="강점 제목"
            />
          </div>
          <IconSelector
            className="ml-2 min-w-[90px]"
            value={strength.icon}
            onChange={handleIconChange}
          />
        </div>
        <div>
          <Label>설명</Label>
          <Textarea
            value={strength.description}
            onChange={handleDescriptionChange}
            placeholder="강점 설명"
            rows={3}
          />
        </div>
      </div>
    </Card>
  );
});

