'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: '회사소개', href: '#about' },
    { label: '사업소개', href: '#business' },
    { label: '제품소개', href: '#products' },
    { label: '문의', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1497px] mx-auto px-8">
        <nav className="flex items-center justify-between h-20">
          {/* 로고 */}
          <div className="w-13 h-13 bg-white rounded-xl border-2 border-[#E5E7EB] shadow-sm p-2.5 flex items-center justify-center">
            <Image
              src="/logo-192.png"
              alt="시온 페인팅"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
          </div>

          {/* 네비게이션 메뉴 */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.href)}
                className={`text-base font-normal transition-colors duration-300 hover:text-[#1A2C6D] ${
                  isScrolled ? 'text-[#101828]' : 'text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* 고객센터 드롭다운 */}
            <div className="relative group">
              <button
                className={`text-base font-normal transition-colors duration-300 hover:text-[#1A2C6D] flex items-center gap-1 ${
                  isScrolled ? 'text-[#101828]' : 'text-white'
                }`}
              >
                고객센터
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform group-hover:rotate-180"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.33"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* 드롭다운 메뉴는 추후 구현 */}
            </div>

            <button 
              className={`px-5 py-2.5 rounded-xl text-base font-normal transition-colors ${
                isScrolled 
                  ? 'bg-[#1A2C6D] text-white hover:bg-[#15204f]' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              로그인
            </button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className={`md:hidden transition-colors duration-300 ${
              isScrolled ? 'text-[#101828]' : 'text-white'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </nav>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 bg-white border-t border-gray-200">
            <div className="flex flex-col gap-4 pt-4">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.href)}
                  className="text-base font-normal text-[#101828] hover:text-[#1A2C6D] text-left transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button className="px-5 py-2.5 bg-[#1A2C6D] text-white rounded-xl text-base font-normal w-fit">
                로그인
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

