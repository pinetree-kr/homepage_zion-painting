'use client';

import { useState } from 'react';
import Container from '../layout/Container';

// Icon Components (lucide-react 기반)
const LayersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
  </svg>
);

const DropletsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
  </svg>
);

const WindIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
  </svg>
);

const GaugeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m12 14 4-4"/>
    <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
  </svg>
);

export default function Business() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const businessAreas = [
    {
      icon: LayersIcon,
      title: '자동 도장 시스템',
      description: '자동차 및 산업용 자동 도장 라인 설계 및 시공',
      features: ['로봇 도장 시스템', '컨베이어 시스템', '자동 제어 시스템'],
    },
    {
      icon: DropletsIcon,
      title: '도장 부스',
      description: '다양한 산업 분야에 적용 가능한 도장 부스 제작',
      features: ['건식/습식 부스', '분체 도장 부스', '특수 도장 부스'],
    },
    {
      icon: WindIcon,
      title: '건조로 시스템',
      description: '효율적인 열처리 및 건조 시스템 제공',
      features: ['적외선 건조로', '열풍 건조로', '가스/전기 건조로'],
    },
    {
      icon: GaugeIcon,
      title: '환경 설비',
      description: '친환경 도장설비 및 배기처리 시스템',
      features: ['VOC 처리설비', '집진 시스템', '폐수 처리 설비'],
    },
  ];

  const industries = ['자동차', '전자', '건설기계', '조선', '항공', '가구'];

  const achievements = [
    {
      id: '1',
      date: '2024-12-15',
      title: '현대자동차 도장라인 구축',
      content: '현대자동차 아산공장 완전 자동화 도장라인 구축 완료',
      category: '자동차'
    },
    {
      id: '2',
      date: '2024-11-20',
      title: '삼성전자 가전제품 도장설비',
      content: '삼성전자 수원공장 가전제품 도장설비 납품',
      category: '가전'
    },
    {
      id: '3',
      date: '2024-10-10',
      title: 'LG전자 친환경 도장라인',
      content: 'LG전자 창원공장 친환경 도장라인 설치',
      category: '가전'
    },
    {
      id: '4',
      date: '2024-09-05',
      title: '기아자동차 스마트 도장설비',
      content: '기아자동차 화성공장 AI 기반 스마트 도장설비 구축',
      category: '자동차'
    }
  ];

  const categories = ['전체', ...Array.from(new Set(achievements.map(a => a.category)))];
  
  const filteredAchievements = selectedCategory === '전체' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <section id="business" className="bg-white py-24">
      <Container>
        {/* 섹션 헤더 */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">사업소개</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            다양한 산업 분야에 특화된 도장설비 솔루션을 제공하고,
            <br />
            검증된 실적으로 고객의 신뢰를 얻고 있습니다
          </p>
        </div>

        {/* 사업분야 섹션 */}
        <div className="mb-24">
          <div className="mb-12">
            <h3 className="text-2xl font-normal text-gray-900 mb-2">사업분야</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {businessAreas.map((area, index) => {
              const IconComponent = area.icon;
              return (
                <div
                  key={area.title}
                  className="group relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2CA7DB]/10 to-[#1A2C6D]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="text-white w-8 h-8" />
                    </div>
                    
                    <h3 className="text-gray-900 mb-3 text-xl font-normal">{area.title}</h3>
                    <p className="text-gray-600 mb-6">{area.description}</p>
                    
                    <div className="space-y-2">
                      {area.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#2CA7DB] rounded-full" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Industries Served */}
          <div className="mt-12 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-2xl p-12 text-center">
            <h3 className="text-2xl font-normal text-white mb-8">주요 적용 산업</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {['자동차', '전자', '건설기계', '조선', '항공', '가구'].map((industry, index) => (
                <div
                  key={industry}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/30 transition-colors"
                >
                  <p className="text-white">{industry}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 사업실적 섹션 */}
        <div>
          <div className="mb-12">
            <h3 className="text-2xl font-normal text-gray-900 mb-2">사업실적</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-full mb-6" />
            
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 사업실적 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* 카테고리 배지 */}
                <div className="absolute top-6 right-6">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] text-white text-xs rounded-full">
                    {achievement.category}
                  </span>
                </div>

                {/* 날짜 */}
                <div className="text-sm text-gray-500 mb-3">
                  {new Date(achievement.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                {/* 제목 */}
                <h4 className="text-gray-900 mb-4 pr-20 group-hover:text-[#1A2C6D] transition-colors text-xl font-normal">
                  {achievement.title}
                </h4>

                {/* 내용 */}
                <p className="text-gray-600 line-clamp-3">
                  {achievement.content}
                </p>

                {/* 하단 장식 */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A2C6D] via-[#2CA7DB] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          {/* 실적이 없을 때 */}
          {filteredAchievements.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              해당 카테고리의 사업실적이 없습니다.
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

