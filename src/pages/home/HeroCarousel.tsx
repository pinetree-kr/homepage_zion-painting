'use client';

import { useState, useEffect, useCallback } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/src/shared/ui';
import Image from 'next/image';

interface HeroCarouselItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
}

interface HeroCarouselProps {
  items: HeroCarouselItem[];
  defaultTitle: string;
  defaultDescription: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

const gradientBackground = 'linear-gradient(135deg, rgba(120, 120, 120, 1) 0%, rgba(80, 80, 80, 1) 50%, rgba(100, 100, 100, 1) 100%)';

export default function HeroCarousel({ 
  items, 
  defaultTitle, 
  defaultDescription,
  onTitleChange,
  onDescriptionChange
}: HeroCarouselProps) {
  const [currentTitle, setCurrentTitle] = useState<string>(defaultTitle);
  const [currentDescription, setCurrentDescription] = useState<string>(defaultDescription);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 캐러셀이 변경될 때 텍스트 업데이트
  const handleCarouselChange = useCallback((index: number) => {
    if (items[index]) {
      const newTitle = items[index].title;
      const newDescription = items[index].description;
      
      setCurrentTitle(newTitle);
      setCurrentDescription(newDescription);
      
      onTitleChange?.(newTitle);
      onDescriptionChange?.(newDescription);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('heroTitleChange', { detail: newTitle }));
        window.dispatchEvent(new CustomEvent('heroDescriptionChange', { detail: newDescription }));
      }
    } else {
      setCurrentTitle(defaultTitle);
      setCurrentDescription(defaultDescription);
      
      onTitleChange?.(defaultTitle);
      onDescriptionChange?.(defaultDescription);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('heroTitleChange', { detail: defaultTitle }));
        window.dispatchEvent(new CustomEvent('heroDescriptionChange', { detail: defaultDescription }));
      }
    }
  }, [items, defaultTitle, defaultDescription, onTitleChange, onDescriptionChange]);

  // 캐러셀 API가 변경될 때 이벤트 리스너 등록
  useEffect(() => {
    if (!api) return;

    const updateCurrent = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex);
      handleCarouselChange(selectedIndex);
    };

    // 초기 상태 설정
    updateCurrent();

    // 이벤트 리스너 등록
    api.on('select', updateCurrent);
    api.on('reInit', updateCurrent);

    // cleanup 함수
    return () => {
      api.off('select', updateCurrent);
      api.off('reInit', updateCurrent);
    };
  }, [api, handleCarouselChange]);

  // 인디케이터 클릭 시 해당 슬라이드로 이동
  const scrollTo = useCallback((index: number) => {
    if (!api) return;
    setIsPaused(true); // 수동 클릭 시 자동 전환 일시 중지
    api.scrollTo(index);
    // 3초 후 자동 전환 재개
    setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  }, [api]);

  // 자동 슬라이드 전환
  useEffect(() => {
    if (!api || items.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // 5초마다 자동 전환

    return () => {
      clearInterval(interval);
    };
  }, [api, items.length, isPaused]);

  if (items.length === 0) {
    return (
      <div 
        className="w-full h-full"
        style={{ background: gradientBackground }}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full h-full"
        setApi={setApi}
      >
        <CarouselContent className="h-screen">
          {items.map((item, index) => (
            <CarouselItem key={item.id} className="h-screen p-0">
              <div className="relative w-full h-full">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                  onError={(e) => {
                    // 이미지 로드 실패 시 그라데이션 배경 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.style.background = gradientBackground;
                    }
                  }}
                />
                {/* 이미지 위 어두운 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 pointer-events-none" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* 인디케이터 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2 pointer-events-auto">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              current === index
                ? 'w-8 h-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                : 'w-2 h-2 bg-gray-400 shadow-[0_0_4px_rgba(0,0,0,0.3)] hover:bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

