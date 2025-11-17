'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, Save, GripVertical, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { toast } from 'sonner';
import Image from 'next/image';
import { supabase } from '@/src/shared/lib/supabase';

interface CarouselItem {
  id: string;
  dbId?: string; // 데이터베이스 ID (저장된 항목만)
  imageUrl: string;
  imagePath?: string; // Storage 경로 (삭제용)
  text: string; // 하위 호환성을 위해 유지
  title: string;
  description: string;
  order: number;
  isUploading?: boolean; // 업로드 중 상태
}

export default function Prologue() {
  const [defaultTitle, setDefaultTitle] = useState('');
  const [defaultDescription, setDefaultDescription] = useState('');
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        .single() as { data: { 
          default_title: string | null;
          default_description: string | null;
        } | null; error: any };

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
        .order('display_order', { ascending: true }) as { data: Array<{
          id: string;
          image_url: string;
          title: string | null;
          description: string | null;
          display_order: number;
        }> | null; error: any };

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
        }));
        setCarouselItems(items);
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
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
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

      // 파일 크기 확인 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: 파일 크기는 5MB 이하여야 합니다.`);
        continue;
      }

      // 임시 미리보기용 base64 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        const tempId = Date.now().toString() + index + Math.random().toString(36).substr(2, 9);
        const tempItem: CarouselItem = {
          id: tempId,
          imageUrl: reader.result as string,
          title: '',
          description: '',
          order: carouselItems.length + index + 1,
          isUploading: true,
        };
        
        setCarouselItems((prev) => [...prev, tempItem]);

        // Supabase Storage에 업로드
        uploadImageToStorage(file).then((publicUrl) => {
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
      reader.readAsDataURL(file);
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

  const removeCarouselItem = async (id: string) => {
    const item = carouselItems.find((item) => item.id === id);
    
    // Storage에서 이미지 삭제
    if (item?.imagePath) {
      await deleteImageFromStorage(item.imagePath);
    }

    // DB에서 삭제 (저장된 항목인 경우)
    if (item?.dbId) {
      const { error } = await supabase
        .from('prologue_carousel_items')
        .delete()
        .eq('id', item.dbId);

      if (error) {
        console.error('DB 삭제 오류:', error);
        toast.error('항목 삭제에 실패했습니다.');
        return;
      }
    }

    // 로컬 상태에서 제거
    setCarouselItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('항목이 삭제되었습니다.');
  };

  const updateCarouselItem = (id: string, field: keyof CarouselItem, value: string) => {
    setCarouselItems(carouselItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

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

      // 새 항목들 저장
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

      // 데이터 다시 로드하여 DB ID 업데이트
      await loadData();
      toast.success('프롤로그 정보가 저장되었습니다.');
    } catch (error) {
      console.error('저장 중 오류:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">프롤로그 관리</h2>
          <p className="text-gray-500 text-sm mt-1">캐러셀에 표시될 이미지와 텍스트를 관리합니다</p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
          {isSaving ? (
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

      <Card className="p-6">
        <div className="space-y-6">
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

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm">캐러셀 이미지 관리</p>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="carousel-image-upload"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  이미지 추가
                </Button>
              </div>
            </div>

            {carouselItems.length === 0 ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDragging ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {isDragging ? '이미지를 여기에 놓으세요' : '이미지를 드래그하여 업로드하거나 클릭하여 선택하세요'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {carouselItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move mt-2 flex-shrink-0" />
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-48 h-32 relative border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
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
                              onChange={(e) => updateCarouselItem(item.id, 'title', e.target.value)}
                              placeholder={defaultTitle || "이미지별 타이틀을 입력하세요 (비어있으면 대표 타이틀이 표시됩니다)"}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>설명 (선택사항)</Label>
                            <Textarea
                              value={item.description}
                              onChange={(e) => updateCarouselItem(item.id, 'description', e.target.value)}
                              placeholder={defaultDescription || "이미지별 설명을 입력하세요 (비어있으면 대표 설명이 표시됩니다)"}
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-500 text-xs">
                              순서: {index + 1} / {carouselItems.length}
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
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeCarouselItem(item.id)}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

