'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/src/shared/ui';

interface CompanyAboutNavigationProps {
  hasIntroduction?: boolean;
  hasGreetings?: boolean;
}

const baseSections = [
  { id: 'overview', label: '회사개요' },
  { id: 'history', label: '연혁' },
  { id: 'organization', label: '조직도' },
  { id: 'location', label: '오시는 길' },
];

export default function CompanyAboutNavigation({ hasIntroduction = false, hasGreetings = false }: CompanyAboutNavigationProps) {
  // 회사개요가 있으면 포함, 없으면 제외
  let sections = hasIntroduction ? [baseSections[0]] : [];
  
  // 대표 인사말이 있으면 회사개요 다음에 추가
  if (hasGreetings) {
    sections.push({ id: 'greetings', label: '대표 인사말' });
  }
  
  // 나머지 섹션들 추가 (연혁, 조직도, 오시는 길)
  sections = [...sections, ...baseSections.slice(1)];
  
  // 초기 활성 섹션 설정 (회사개요가 있으면 overview, 없으면 첫 번째 섹션)
  const getInitialSection = () => {
    if (hasIntroduction) return 'overview';
    if (hasGreetings) return 'greetings';
    return baseSections[1]?.id || 'history';
  };
  
  const [activeSection, setActiveSection] = useState<string>(getInitialSection());
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const HEADER_HEIGHT = 73; // 레이아웃 헤더 높이
    const NAV_HEIGHT = 64; // 네비게이션 바 높이 (대략)

    // useEffect 내부에서 sections 재계산
    let currentSections = hasIntroduction ? [baseSections[0]] : [];
    if (hasGreetings) {
      currentSections.push({ id: 'greetings', label: '대표 인사말' });
    }
    currentSections = [...currentSections, ...baseSections.slice(1)];

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // 현재 보이는 섹션 찾기 (레이아웃 헤더 + 네비게이션 바 높이 고려)
      const scrollPosition = window.scrollY + HEADER_HEIGHT + NAV_HEIGHT + 50;

      for (let i = currentSections.length - 1; i >= 0; i--) {
        const section = document.getElementById(currentSections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(currentSections[i].id);
          break;
        }
      }
    };

    // 초기 활성 섹션 업데이트
    const initialSection = hasIntroduction ? 'overview' : (hasGreetings ? 'greetings' : baseSections[1]?.id || 'history');
    setActiveSection(initialSection);

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 실행

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [hasIntroduction, hasGreetings]);

  const handleNavClick = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const HEADER_HEIGHT = 73; // 레이아웃 헤더 높이
      const NAV_HEIGHT = 64; // 네비게이션 바 높이 (대략)
      const offsetTop = section.offsetTop - HEADER_HEIGHT - NAV_HEIGHT;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      className={'sticky top-[73px] z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all shadow-sm'}
    >
      <Container>
        <div className="flex justify-center gap-1 md:gap-0">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`
                md:px-6 md:py-4 px-4 py-3 text-base font-medium transition-all relative
                ${activeSection === section.id
                  ? 'text-[#1A2C6D] border-b-2 border-[#1A2C6D] font-semibold'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300'
                }
              `}
            >
              {section.label}
            </button>
          ))}
        </div>
      </Container>
    </nav>
  );
}
