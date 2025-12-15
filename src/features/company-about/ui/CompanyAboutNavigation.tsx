'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/src/shared/ui';

const sections = [
  { id: 'overview', label: '회사개요' },
  { id: 'history', label: '연혁' },
  { id: 'organization', label: '조직도' },
  { id: 'location', label: '오시는 길' },
];

export default function CompanyAboutNavigation() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // 현재 보이는 섹션 찾기
      const scrollPosition = window.scrollY + 200; // 헤더 높이 고려

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 실행

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleNavClick = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offsetTop = section.offsetTop - 100; // 헤더 높이 고려
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all ${
        isScrolling ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <Container>
        <div className="flex justify-center gap-1 md:gap-0">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`
                px-6 py-4 text-base font-medium transition-all relative
                ${
                  activeSection === section.id
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
