'use client';

import { Container } from '@/src/shared/ui';

interface CompanyAboutHeroProps {
  title?: string;
  description?: string;
}

export default function CompanyAboutHero({ 
  title = '회사소개',
  description 
}: CompanyAboutHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] min-h-[35vh] flex items-center justify-center overflow-hidden mt-18">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <Container className="relative z-10">
        <div className="text-center text-white py-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">{title}</h1>
          {description && (
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
