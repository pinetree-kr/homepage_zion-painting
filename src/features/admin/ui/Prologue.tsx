'use client';

import { useState, useRef } from 'react';
import { Trash2, Save, GripVertical, Upload } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { toast } from 'sonner';
import Image from 'next/image';

interface CarouselItem {
  id: string;
  imageUrl: string;
  text: string;
  order: number;
}

export default function Prologue() {
  const [defaultText, setDefaultText] = useState('');
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem: CarouselItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          imageUrl: reader.result as string,
          text: '',
          order: carouselItems.length + 1,
        };
        setCarouselItems([...carouselItems, newItem]);
      };
      reader.readAsDataURL(file);
    });

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeCarouselItem = (id: string) => {
    setCarouselItems(carouselItems.filter(item => item.id !== id));
  };

  const updateCarouselItem = (id: string, field: keyof CarouselItem, value: string) => {
    setCarouselItems(carouselItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    toast.success('프롤로그 정보가 저장되었습니다.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">프롤로그 관리</h2>
          <p className="text-gray-500 text-sm mt-1">캐러셀에 표시될 이미지와 텍스트를 관리합니다</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          저장
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label>대표 텍스트</Label>
            <Input
              value={defaultText}
              onChange={(e) => setDefaultText(e.target.value)}
              placeholder="모든 캐러셀 이미지에 공통으로 표시될 대표 텍스트를 입력하세요"
              className="mt-1"
            />
            <p className="text-gray-500 text-xs mt-2">
              이미지별 텍스트가 비어있을 때 대표 텍스트가 표시됩니다
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">이미지를 업로드하여 캐러셀을 구성하세요</p>
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
                          {item.imageUrl ? (
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
                        <div className="flex-1">
                          <Label>텍스트 (선택사항)</Label>
                          <Input
                            value={item.text}
                            onChange={(e) => updateCarouselItem(item.id, 'text', e.target.value)}
                            placeholder={defaultText || "이미지별 텍스트를 입력하세요 (비어있으면 대표 텍스트가 표시됩니다)"}
                            className="mt-1"
                          />
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-500 text-xs">
                              순서: {index + 1} / {carouselItems.length}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {item.text ? (
                                <span className="text-blue-600">✓ 이미지별 텍스트 사용</span>
                              ) : defaultText ? (
                                <span className="text-gray-500">→ 대표 텍스트 사용: "{defaultText}"</span>
                              ) : (
                                <span className="text-gray-400">텍스트 없음</span>
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

