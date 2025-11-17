'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/src/shared/ui';

interface HeroContentProps {
  defaultTitle: string;
  defaultDescription: string;
}

export default function HeroContent({ defaultTitle, defaultDescription }: HeroContentProps) {
  const [currentTitle, setCurrentTitle] = useState<string>(defaultTitle);
  const [currentDescription, setCurrentDescription] = useState<string>(defaultDescription);

  useEffect(() => {
    // HeroCarousel에서 타이틀 변경 이벤트 수신
    const handleTitleChange = (event: CustomEvent<string>) => {
      setCurrentTitle(event.detail);
    };

    // HeroCarousel에서 설명 변경 이벤트 수신
    const handleDescriptionChange = (event: CustomEvent<string>) => {
      setCurrentDescription(event.detail);
    };

    window.addEventListener('heroTitleChange', handleTitleChange as EventListener);
    window.addEventListener('heroDescriptionChange', handleDescriptionChange as EventListener);

    return () => {
      window.removeEventListener('heroTitleChange', handleTitleChange as EventListener);
      window.removeEventListener('heroDescriptionChange', handleDescriptionChange as EventListener);
    };
  }, []);

  return (
    <Container className="relative z-10 py-24 pt-[20rem]">
      <div className="flex flex-col items-center text-center gap-6">
        {/* 제목 */}
        <div className="flex flex-col gap-4">
          {currentTitle && (
            <h1 className="text-4xl md:text-5xl font-normal text-white leading-tight drop-shadow-lg">
              {currentTitle}
            </h1>
          )}
          {currentDescription && (
            <p className="text-lg md:text-xl text-white/90 leading-relaxed drop-shadow-md whitespace-pre-line md:whitespace-normal">
              {currentDescription}
            </p>
          )}
        </div>

        {/* 버튼 그룹 */}
        {/* <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button className="group px-8 py-4 bg-white text-[#1A2C6D] rounded-full hover:bg-[#A5C93E] hover:text-white transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
            제품 카탈로그
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:translate-x-1 transition-transform"
            >
              <path 
                d="M7.5 15L12.5 10L7.5 5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="group px-8 py-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/20">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="10" cy="10" r="3" fill="currentColor"/>
            </svg>
            시설 둘러보기
          </button>
        </div> */}

        {/* 스크롤 인디케이터 */}
        {/* <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 mt-16">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
          </div>
        </div> */}
      </div>
    </Container>
  );
}

