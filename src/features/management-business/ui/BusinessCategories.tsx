'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui';
import { toast } from 'sonner';
import { BusinessCategory } from '@/src/entities';
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
import {
  getBusinessCategories,
  saveBusinessCategory,
  deleteBusinessCategory,
  updateBusinessCategoriesOrder,
} from '../api/business-actions';

// SortableCategoryItem 컴포넌트
function SortableCategoryItem({
  category,
  onEdit,
  onRemove,
}: {
  category: BusinessCategory;
  onEdit: (category: BusinessCategory) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white ${
        isDragging ? 'border-blue-500 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <span className="text-gray-900 font-medium">{category.title}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(category)}
        >
          <Edit className="h-4 w-4 mr-1" />
          수정
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(category.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          삭제
        </Button>
      </div>
    </div>
  );
}

export default function BusinessCategories() {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoriesData = await getBusinessCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!selectedCategory || !selectedCategory.title?.trim()) {
      toast.error('적용산업명을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      const result = await saveBusinessCategory(selectedCategory);
      if (result.success) {
        toast.success('적용산업이 저장되었습니다.');
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        await loadData();
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

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('이 적용산업을 삭제하시겠습니까? 관련된 사업실적의 적용산업이 해제됩니다.')) {
      return;
    }

    try {
      const result = await deleteBusinessCategory(id);
      if (result.success) {
        toast.success('적용산업이 삭제되었습니다.');
        await loadData();
      } else {
        toast.error(`삭제 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('삭제 오류:', error);
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over.id);
      
      const reorderedCategories = arrayMove(categories, oldIndex, newIndex).map((category, index) => ({
        ...category,
        display_order: index,
      }));

      setCategories(reorderedCategories);

      // 순서 업데이트 API 호출
      try {
        const updateData = reorderedCategories.map((cat, index) => ({
          id: cat.id,
          display_order: index,
        }));
        
        const result = await updateBusinessCategoriesOrder(updateData);
        if (result.success) {
          toast.success('순서가 변경되었습니다.');
        } else {
          toast.error(`순서 변경 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
          // 실패 시 원래 데이터로 복구
          await loadData();
        }
      } catch (error: any) {
        console.error('순서 변경 오류:', error);
        toast.error(`순서 변경 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        // 실패 시 원래 데이터로 복구
        await loadData();
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">적용산업 목록</h3>
          <Button 
            onClick={() => { 
              setSelectedCategory({ id: '', title: '', display_order: categories.length }); 
              setIsEditDialogOpen(true); 
            }} 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            적용산업 추가
          </Button>
        </div>

        {isMounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={categories.map((cat) => cat.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {categories.map((category) => (
                  <SortableCategoryItem
                    key={category.id}
                    category={category}
                    onEdit={(cat) => {
                      setSelectedCategory(cat);
                      setIsEditDialogOpen(true);
                    }}
                    onRemove={handleDeleteCategory}
                  />
                ))}
                {categories.length === 0 && (
                  <p className="text-gray-500 text-center py-8">등록된 적용산업이 없습니다.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <span className="text-gray-900">{category.title}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    수정
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-gray-500 text-center py-8">등록된 적용산업이 없습니다.</p>
            )}
          </div>
        )}
      </Card>

      {/* 카테고리 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>적용산업 {selectedCategory?.id ? '수정' : '추가'}</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label>적용산업명</Label>
                <Input
                  value={selectedCategory.title}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, title: e.target.value })}
                  placeholder="예: 자동차, 전자, 건설기계"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setIsEditDialogOpen(false); 
                    setSelectedCategory(null); 
                  }}
                  disabled={saving}
                >
                  취소
                </Button>
                <Button onClick={handleSaveCategory} disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

