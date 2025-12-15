'use client';

import { useState } from 'react';
import { Container } from '@/src/shared/ui';
import type { BusinessInfo, BusinessArea, BusinessCategory, Achievement } from '@/src/entities/business/model/types';
import { formatDate } from '@/src/shared/lib/utils';

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

// 아이콘 매핑 함수
const getIconComponent = (iconName?: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayersIcon,
    DropletsIcon,
    WindIcon,
    GaugeIcon,
  };
  return iconMap[iconName || ''] || LayersIcon;
};

interface BusinessProps {
  businessInfo: BusinessInfo | null;
  categories: BusinessCategory[];
  achievements: (Achievement & { category?: BusinessCategory | null })[];
}

export default function Business({ businessInfo, categories, achievements }: BusinessProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('전체');

  const introduction = businessInfo?.introduction || '';
  const businessAreas = businessInfo && Array.isArray(businessInfo.areas) ? businessInfo.areas : [];

  const filteredAchievements = selectedCategoryId === '전체'
    ? achievements
    : achievements.filter(a => a.category_id === selectedCategoryId);

  return (
    <section id="business" className="bg-white py-24">
      <Container>
        {/* 섹션 헤더 */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">사업소개</h2>
          {introduction && (
            <div 
              className="text-xl text-gray-600 max-w-3xl mx-auto ck-content"
              dangerouslySetInnerHTML={{ __html: introduction }}
            />
          )}
          {!introduction && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              다양한 산업 분야에 특화된 도장설비 솔루션을 제공하고,
              <br />
              검증된 실적으로 고객의 신뢰를 얻고 있습니다
            </p>
          )}
        </div>

        {/* 사업분야 섹션 */}
        {businessAreas.length > 0 && (
          <div className="mb-24">
            <div className="mb-12">
              <h3 className="text-2xl font-normal text-gray-900 mb-2">사업분야</h3>
              <div className="w-20 h-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {businessAreas.map((area, index) => {
                const IconComponent = getIconComponent(area.icon);
                return (
                  <div
                    key={area.id || index}
                    className="group relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2CA7DB]/10 to-[#1A2C6D]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                    
                    <div className="relative">
                      {area.icon && (
                        <div className="w-16 h-16 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="text-white w-8 h-8" />
                        </div>
                      )}
                      
                      <h3 className="text-gray-900 mb-3 text-xl font-normal">{area.title}</h3>
                      <p className="text-gray-600 mb-6">{area.description}</p>
                      
                      {area.features && area.features.length > 0 && (
                        <div className="space-y-2">
                          {area.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-[#2CA7DB] rounded-full" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Industries Served */}
            {categories.length > 0 && (
              <div className="mt-12 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-2xl p-12 text-center">
                <h3 className="text-2xl font-normal text-white mb-8">주요 적용 산업</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/30 transition-colors"
                    >
                      <p className="text-white">{category.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 사업실적 섹션 */}
        {achievements.length > 0 && (
          <div>
            <div className="mb-12">
              <h3 className="text-2xl font-normal text-gray-900 mb-2">사업실적</h3>
              <div className="w-20 h-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-full mb-6" />
              
              {/* 카테고리 필터 */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setSelectedCategoryId('전체')}
                    className={`px-6 py-2 rounded-full transition-all duration-300 ${
                      selectedCategoryId === '전체'
                        ? 'bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`px-6 py-2 rounded-full transition-all duration-300 ${
                        selectedCategoryId === category.id
                          ? 'bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 사업실적 카드 그리드 */}
            {filteredAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* 카테고리 배지 */}
                    {achievement.category && (
                      <div className="absolute top-6 right-6">
                        <span className="px-3 py-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] text-white text-xs rounded-full">
                          {achievement.category.title}
                        </span>
                      </div>
                    )}

                    {/* 날짜 */}
                    <div className="text-sm text-gray-500 mb-3">
                      {formatDate(achievement.achievement_date, 'YYYY년 M월 D일')}
                    </div>

                    {/* 제목 */}
                    <h4 className="text-gray-900 mb-4 pr-20 group-hover:text-[#1A2C6D] transition-colors text-xl font-normal">
                      {achievement.title}
                    </h4>

                    {/* 내용 */}
                    <div 
                      className="text-gray-600 line-clamp-3 ck-content"
                      dangerouslySetInnerHTML={{ __html: achievement.content }}
                    />

                    {/* 하단 장식 */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A2C6D] via-[#2CA7DB] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                해당 카테고리의 사업실적이 없습니다.
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
