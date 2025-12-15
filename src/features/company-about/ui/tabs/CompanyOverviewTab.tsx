'use client';

import * as LucideIcons from 'lucide-react';
import type { CompanyAbout } from '@/src/entities/company/model/types';
import type { LucideIcon } from 'lucide-react';

interface CompanyOverviewTabProps {
  aboutInfo: CompanyAbout | null;
}

export default function CompanyOverviewTab({ aboutInfo }: CompanyOverviewTabProps) {
  const introduction = aboutInfo?.introduction || '';
  const greetings = aboutInfo?.greetings || '';
  const vision = aboutInfo?.vision || '';
  const mission = aboutInfo?.mission || '';
  const strengths = aboutInfo?.strengths || [];
  const values = aboutInfo?.values || [];
  // Lucide 아이콘 동적 로드
  const getIconComponent = (iconName: string) => {
    if (!iconName || !(iconName in LucideIcons)) {
      return null;
    }
    return LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
  };

  // 데이터가 없을 때
  if (!introduction && !greetings && !vision && !mission && strengths.length === 0 && values.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">회사 소개 정보가 아직 등록되지 않았습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 회사 소개글 */}
      {introduction && (
        <div>
          {/* <h2 className="text-3xl font-bold text-gray-900 mb-6">회사 소개</h2> */}
          <div
            className="prose prose-lg text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: introduction }}
          />
        </div>
      )}

      {/* 대표 인사말 */}
      {greetings && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">대표 인사말</h2>
          <div
            className="prose prose-lg text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: greetings }}
          />
        </div>
      )}

      {/* 기업 비전 및 미션 */}
      {(vision || mission) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {vision && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">기업 비전</h2>
              <div
                className="prose prose-lg text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: vision }}
              />
            </div>
          )}
          {mission && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">기업 미션</h2>
              <div
                className="prose prose-lg text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: mission }}
              />
            </div>
          )}
        </div>
      )}

      {/* 핵심 강점 */}
      {strengths.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">핵심 강점</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {strengths.map((strength, index) => {
              const IconComponent = getIconComponent(strength.icon);
              return (
                <div
                  key={strength.id || index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  {IconComponent && (
                    <div className="w-14 h-14 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] rounded-xl flex items-center justify-center mb-4">
                      <IconComponent className="text-white w-7 h-7" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{strength.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{strength.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 핵심 가치 */}
      {values.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">핵심 가치</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={value.id || index} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#2CA7DB] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
