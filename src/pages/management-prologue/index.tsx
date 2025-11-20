'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, Save, GripVertical, Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { toast } from 'sonner';
import Image from 'next/image';
import { supabase } from '@/src/shared/lib/supabase/client';
import { resizeImage } from '@/src/shared/lib';
import { PrologueCarouselItem, PrologueSettings } from '@/src/entities';
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

interface CarouselItem {
  id: string;
  dbId?: string; // 데이터베이스 ID (저장된 항목만)
  imageUrl: string;
  imagePath?: string; // Storage 경로 (삭제용)
  title: string;
  description: string;
  order: number;
  isUploading?: boolean; // 업로드 중 상태
}

// SortableItem 컴포넌트
function SortableItem({
  item,
  index,
  totalCount,
  defaultTitle,
  defaultDescription,
  onUpdate,
  onRemove,
}: {
  item: CarouselItem;
  index: number;
  totalCount: number;
  defaultTitle: string;
  defaultDescription: string;
  onUpdate: (id: string, field: keyof CarouselItem, value: string) => void;
  onRemove: (id: string) => void;
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
      className={`relative flex gap-4 items-start p-4 md:p-6 lg:pt-6 lg:pr-12 border rounded-lg bg-white ${isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'
        }`}
    >
      {/* 우상단 삭제 버튼 */}
      <div className="absolute top-2 right-2 hidden lg:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id)}
          className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 z-10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div
        {...attributes}
        {...listeners}
        className="hidden lg:block h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing mt-2 flex-shrink-0 hover:text-gray-600 transition-colors"
      >
        <GripVertical className="h-full w-full" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-shrink-0 w-full lg:w-48 h-48 lg:h-32 relative border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
            {item.isUploading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={`캐러셀 이미지 ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                이미지 없음
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <Label>타이틀 (선택사항)</Label>
              <Input
                value={item.title}
                onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
                placeholder={defaultTitle || "이미지별 타이틀을 입력하세요 (비어있으면 대표 타이틀이 표시됩니다)"}
                className="mt-1"
              />
            </div>
            <div>
              <Label>설명 (선택사항)</Label>
              <Textarea
                value={item.description}
                onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                placeholder={defaultDescription || "이미지별 설명을 입력하세요 (비어있으면 대표 설명이 표시됩니다)"}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-gray-500 text-xs">
                순서: {index + 1} / {totalCount}
              </p>
              <p className="text-gray-400 text-xs">
                {item.title || item.description ? (
                  <span className="text-blue-600">✓ 이미지별 타이틀/설명 사용</span>
                ) : (defaultTitle || defaultDescription) ? (
                  <span className="text-gray-500">→ 대표 타이틀/설명 사용</span>
                ) : (
                  <span className="text-gray-400">타이틀/설명 없음</span>
                )}
              </p>
            </div>
            <div className="lg:hidden">
              <Button
                variant='destructive'
                size="sm"
                onClick={() => onRemove(item.id)}
                className="rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 z-10"
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagementProloguePage() {
  const [defaultTitle, setDefaultTitle] = useState('');
  const [defaultDescription, setDefaultDescription] = useState('');
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [originalCarouselItems, setOriginalCarouselItems] = useState<CarouselItem[]>([]); // 초기 로드된 항목들 (삭제 추적용)
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingCarouselItems, setIsSavingCarouselItems] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // 프롤로그 설정 로드
      const { data: settingsData, error: settingsError } = await supabase
        .from('prologue_settings')
        .select('default_title, default_description')
        .single()
        .overrideTypes<PrologueSettings>();

      if (settingsError && settingsError.code !== 'PGRST116') {
        // PGRST116은 레코드가 없을 때 발생하는 에러 (무시)
        console.error('설정 로드 오류:', settingsError);
      } else if (settingsData) {
        setDefaultTitle(settingsData.default_title || '');
        setDefaultDescription(settingsData.default_description || '');
      }

      // 캐러셀 아이템 로드
      const { data: itemsData, error: itemsError } = await supabase
        .from('prologue_carousel_items')
        .select('*')
        .order('display_order', { ascending: true })
        .overrideTypes<PrologueCarouselItem[]>();

      if (itemsError) {
        console.error('캐러셀 아이템 로드 오류:', itemsError);
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
      } else if (itemsData) {
        const items: CarouselItem[] = itemsData.map((item) => ({
          id: item.id,
          dbId: item.id,
          imageUrl: item.image_url,
          imagePath: item.image_url?.replace(/^.*\/storage\/v1\/object\/public\/prologue-carousel\//, '') || undefined,
          title: item.title || '',
          description: item.description || '',
          order: item.display_order,
        } as CarouselItem));
        setCarouselItems(items);
        setOriginalCarouselItems(items); // 원본 데이터 저장
      } else {
        setOriginalCarouselItems([]);
      }
    } catch (error) {
      console.error('데이터 로드 중 오류:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `carousel/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('prologue-carousel')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('이미지 업로드 오류:', uploadError);
        toast.error('이미지 업로드에 실패했습니다.');
        return null;
      }

      // 공개 URL 가져오기
      const { data } = supabase.storage
        .from('prologue-carousel')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      toast.error('이미지 업로드에 실패했습니다.');
      return null;
    }
  };

  const deleteImageFromStorage = async (imagePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('prologue-carousel')
        .remove([imagePath]);

      if (error) {
        console.error('이미지 삭제 오류:', error);
        // 삭제 실패해도 계속 진행 (이미 DB에서 삭제됨)
      }
    } catch (error) {
      console.error('이미지 삭제 중 오류:', error);
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (let index = 0; index < fileArray.length; index++) {
      const file = fileArray[index];

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: 이미지 파일만 업로드 가능합니다.`);
        continue;
      }

      try {
        // 이미지 리사이징 (최대 크기: 1920x1080, 최대 용량: 1MB)
        const resizedFile = await resizeImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          maxSizeMB: 1,
          quality: 0.8,
          fileType: 'image/jpeg',
        });

        // 리사이징 후 파일 크기 확인 (5MB 제한 - 안전장치)
        if (resizedFile.size > 1 * 1024 * 1024) {
          toast.error(`${file.name}: 파일 크기가 너무 큽니다.`);
          continue;
        }

        // 임시 미리보기용 base64 생성
        const reader = new FileReader();
        reader.onloadend = () => {
          const tempId = Date.now().toString() + index + Math.random().toString(36).substring(2, 9);
          const tempItem: CarouselItem = {
            id: tempId,
            imageUrl: reader.result as string,
            title: '',
            description: '',
            order: carouselItems.length + index + 1,
            isUploading: true,
          };

          setCarouselItems((prev) => [...prev, tempItem]);

          // Supabase Storage에 업로드 (리사이징된 파일 사용)
          uploadImageToStorage(resizedFile).then((publicUrl) => {
            if (publicUrl) {
              setCarouselItems((prev) =>
                prev.map((item) =>
                  item.id === tempId
                    ? {
                      ...item,
                      imageUrl: publicUrl,
                      imagePath: publicUrl.replace(/^.*\/storage\/v1\/object\/public\/prologue-carousel\//, ''),
                      isUploading: false,
                    }
                    : item
                )
              );
            } else {
              // 업로드 실패 시 임시 항목 제거
              setCarouselItems((prev) => prev.filter((item) => item.id !== tempId));
            }
          });
        };
        reader.readAsDataURL(resizedFile);
      } catch (error) {
        console.error('이미지 처리 오류:', error);
        toast.error(`${file.name}: 이미지 처리 중 오류가 발생했습니다.`);
        continue;
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    processFiles(files);

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    const item = carouselItems.find((item) => item.id === itemToDelete);
    if (!item) {
      setItemToDelete(null);
      return;
    }

    // 새로 추가된 항목(서버에 저장되지 않음)인 경우 Storage에서 이미지 삭제
    if (!item.dbId && item.imagePath) {
      deleteImageFromStorage(item.imagePath);
    }

    // 로컬 상태에서만 제거 (실제 DB 삭제는 저장 시 일괄 처리)
    setCarouselItems((prev) => prev.filter((item) => item.id !== itemToDelete));
    toast.success('항목이 제거되었습니다. 저장 버튼을 클릭하면 변경사항이 적용됩니다.');
    setItemToDelete(null);
  };

  const handleDeleteCancel = () => {
    setItemToDelete(null);
  };

  const updateCarouselItem = (id: string, field: keyof CarouselItem, value: string) => {
    setCarouselItems(carouselItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // DnD 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCarouselItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // order 값 업데이트
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
  };

  // 프롤로그 설정 저장
  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);

      // 프롤로그 설정 저장 또는 업데이트 (단일 레코드만 유지)
      const { data: existingSettings } = await supabase
        .from('prologue_settings')
        .select('id')
        .limit(1)
        .single() as { data: { id: string } | null; error: any };

      if (existingSettings?.id) {
        // 기존 레코드 업데이트
        const { error: updateError } = await (supabase as any)
          .from('prologue_settings')
          .update({
            default_title: defaultTitle,
            default_description: defaultDescription
          })
          .eq('id', existingSettings.id);

        if (updateError) {
          console.error('설정 업데이트 오류:', updateError);
          toast.error('설정 저장에 실패했습니다.');
          return;
        }
      } else {
        // 새 레코드 삽입
        const { error: insertError } = await (supabase as any)
          .from('prologue_settings')
          .insert({
            default_title: defaultTitle,
            default_description: defaultDescription
          });

        if (insertError) {
          console.error('설정 삽입 오류:', insertError);
          toast.error('설정 저장에 실패했습니다.');
          return;
        }
      }

      toast.success('프롤로그 설정이 저장되었습니다.');
    } catch (error) {
      console.error('저장 중 오류:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // 삭제될 항목 확인
  const getItemsToDelete = () => {
    const currentDbIds = new Set(carouselItems.filter(item => item.dbId).map(item => item.dbId!));
    return originalCarouselItems.filter(item => item.dbId && !currentDbIds.has(item.dbId));
  };

  // 캐러셀 아이템 저장 버튼 클릭 핸들러
  const handleSaveCarouselItemsClick = () => {
    const itemsToDelete = getItemsToDelete();

    // 삭제될 항목이 있으면 경고 모달 표시
    if (itemsToDelete.length > 0) {
      setShowDeleteWarning(true);
    } else {
      // 삭제될 항목이 없으면 바로 저장
      handleSaveCarouselItemsConfirm();
    }
  };

  // 캐러셀 아이템 일괄 저장 (실제 저장 수행)
  const handleSaveCarouselItemsConfirm = async () => {
    try {
      setIsSavingCarouselItems(true);
      setShowDeleteWarning(false);

      // 삭제될 항목 찾기 (원본에는 있지만 현재 리스트에는 없는 항목)
      const itemsToDelete = getItemsToDelete();

      // 삭제될 항목의 Storage 이미지 삭제
      for (const item of itemsToDelete) {
        if (item.imagePath) {
          await deleteImageFromStorage(item.imagePath);
        }
      }

      // 삭제될 항목들을 DB에서 삭제
      if (itemsToDelete.length > 0) {
        const deleteIds = itemsToDelete.map(item => item.dbId!);
        const { error: deleteError } = await supabase
          .from('prologue_carousel_items')
          .delete()
          .in('id', deleteIds);

        if (deleteError) {
          console.error('항목 삭제 오류:', deleteError);
          toast.error('항목 삭제에 실패했습니다.');
          return;
        }
      }

      // 기존 항목들 삭제 (순서 재정렬을 위해)
      const existingDbIds = carouselItems
        .filter((item) => item.dbId)
        .map((item) => item.dbId!);

      if (existingDbIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('prologue_carousel_items')
          .delete()
          .in('id', existingDbIds);

        if (deleteError) {
          console.error('기존 항목 삭제 오류:', deleteError);
          toast.error('저장에 실패했습니다.');
          return;
        }
      }

      // 모든 항목을 순서대로 저장 (순서 변경 반영)
      const itemsToSave = carouselItems.map((item, index) => ({
        image_url: item.imageUrl,
        title: item.title || null,
        description: item.description || null,
        display_order: index + 1,
      }));

      if (itemsToSave.length > 0) {
        const { error: insertError } = await (supabase as any)
          .from('prologue_carousel_items')
          .insert(itemsToSave);

        if (insertError) {
          console.error('항목 저장 오류:', insertError);
          toast.error('캐러셀 항목 저장에 실패했습니다.');
          return;
        }
      }

      // 데이터 다시 로드하여 DB ID 업데이트 및 원본 데이터 갱신
      await loadData();
      toast.success('캐러셀 항목이 저장되었습니다.');
    } catch (error) {
      console.error('저장 중 오류:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingCarouselItems(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 text-2xl font-semibold">프롤로그 관리</h2>
        <p className="text-gray-500 text-sm mt-1">캐러셀에 표시될 이미지와 텍스트를 관리합니다</p>
      </div>

      {/* 프롤로그 설정 카드 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 text-lg font-semibold">프롤로그 설정</h3>
            <Button onClick={handleSaveSettings} className="gap-2" disabled={isSavingSettings} size="sm">
              {isSavingSettings ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label>대표 타이틀</Label>
              <Input
                value={defaultTitle}
                onChange={(e) => setDefaultTitle(e.target.value)}
                placeholder="모든 캐러셀 이미지에 공통으로 표시될 대표 타이틀을 입력하세요"
                className="mt-1"
              />
            </div>
            <div>
              <Label>대표 설명</Label>
              <Textarea
                value={defaultDescription}
                onChange={(e) => setDefaultDescription(e.target.value)}
                placeholder="모든 캐러셀 이미지에 공통으로 표시될 대표 설명을 입력하세요"
                className="mt-1"
                rows={3}
              />
            </div>
            <p className="text-gray-500 text-xs">
              이미지별 타이틀/설명이 비어있을 때 대표 타이틀/설명이 표시됩니다
            </p>
          </div>
        </div>
      </Card>

      {/* 캐러셀 이미지 관리 카드 */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 text-lg font-semibold">캐러셀 이미지 관리</h3>
            <Button onClick={handleSaveCarouselItemsClick} className="gap-2" disabled={isSavingCarouselItems} size="sm">
              {isSavingCarouselItems ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="carousel-image-upload"
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={carouselItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {carouselItems.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    index={index}
                    totalCount={carouselItems.length}
                    defaultTitle={defaultTitle}
                    defaultDescription={defaultDescription}
                    onUpdate={updateCarouselItem}
                    onRemove={handleDeleteClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* 이미지 추가 영역 - 항상 하단에 표시 */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer mt-4 ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className={`text-sm font-medium ${isDragging ? 'text-blue-600' : 'text-gray-500'}`}>
              {isDragging ? '이미지를 여기에 놓으세요' : '새 이미지 추가'}
            </p>
            <p className={`text-xs mt-1 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}>
              클릭하여 선택하거나 드래그하여 업로드하세요
            </p>
          </div>
        </div>
      </Card>

      {/* 항목 제거 확인 모달 */}
      {itemToDelete && (
        <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>캐러셀 이미지 제거</DialogTitle>
              <DialogDescription>
                이 캐러셀 이미지를 목록에서 제거하시겠습니까?
                <br />
                <span className="text-red-600 font-medium mt-2 block">
                  ⚠️ 저장 버튼을 누르면 이 변경사항이 적용됩니다.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleDeleteCancel}>
                취소
              </Button>
              <Button onClick={handleDeleteConfirm} variant="destructive">
                제거
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 경고 모달 */}
      {showDeleteWarning && (
        <Dialog open={showDeleteWarning} onOpenChange={(open) => !open && setShowDeleteWarning(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>삭제 경고</DialogTitle>
              <DialogDescription>
                저장 시 <span className="text-red-600 font-semibold">{getItemsToDelete().length}개의 항목</span>이 삭제됩니다.
                <br />
                <br />
                <span className="text-red-600 font-medium block">
                  ⚠️ 이 작업은 되돌릴 수 없습니다. 삭제될 내용을 검토한 후 저장하시겠습니까?
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteWarning(false)}>
                취소
              </Button>
              <Button onClick={handleSaveCarouselItemsConfirm} variant="destructive" disabled={isSavingCarouselItems}>
                {isSavingCarouselItems ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    저장 중...
                  </>
                ) : (
                  '저장하기'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

