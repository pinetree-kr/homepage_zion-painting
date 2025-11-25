'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui';
import { toast } from 'sonner';
import { ProductCategory } from '@/src/entities';
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
  saveProductCategory,
  deleteProductCategory,
  updateProductCategoriesOrder,
} from '../api/product-actions';
import { useRouter } from 'next/navigation';

// SortableCategoryItem 컴포넌트
function SortableCategoryItem({
  category,
  onEdit,
  onRemove,
}: {
  category: ProductCategory;
  onEdit: (category: ProductCategory) => void;
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

export default function ProductCategories({ items }: { items: ProductCategory[] }) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // items prop이 변경될 때 categories 상태 업데이트
  useEffect(() => {
    setCategories(items);
  }, [items]);

  const handleSaveCategory = async () => {
    if (!selectedCategory || !selectedCategory.title?.trim()) {
      toast.error('제품 카테고리명을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      const result = await saveProductCategory(selectedCategory);
      if (result.success) {
        toast.success('제품 카테고리가 저장되었습니다.');
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        router.refresh();
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
    if (!confirm('이 제품 카테고리를 삭제하시겠습니까? 관련된 제품의 카테고리가 해제됩니다.')) {
      return;
    }

    try {
      const result = await deleteProductCategory(id);
      if (result.success) {
        toast.success('제품 카테고리가 삭제되었습니다.');
        router.refresh();
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
        
        const result = await updateProductCategoriesOrder(updateData);
        if (result.success) {
          toast.success('순서가 변경되었습니다.');
        } else {
          toast.error(`순서 변경 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
          // 실패 시 원래 데이터로 복구
          router.refresh();
        }
      } catch (error: any) {
        console.error('순서 변경 오류:', error);
        toast.error(`순서 변경 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        // 실패 시 원래 데이터로 복구
        router.refresh();
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">제품 카테고리 목록</h3>
          <Button 
            onClick={() => { 
              setSelectedCategory({ id: '', title: '', display_order: categories.length }); 
              setIsEditDialogOpen(true); 
            }} 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            제품 카테고리 추가
          </Button>
        </div>

        {categories.length > 0 ? (
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
                  <p className="text-gray-500 text-center py-8">등록된 제품 카테고리가 없습니다.</p>
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
              <p className="text-gray-500 text-center py-8">등록된 제품 카테고리가 없습니다.</p>
            )}
          </div>
        )}
      </Card>

      {/* 카테고리 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>제품 카테고리 {selectedCategory?.id ? '수정' : '추가'}</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label>제품 카테고리명</Label>
                <Input
                  value={selectedCategory.title}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, title: e.target.value })}
                  placeholder="예: 소형도장실, 중형도장실"
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

