import { Container } from '@/src/shared/ui';
import * as LucideIcons from 'lucide-react';
import type { CompanyAbout } from '@/src/entities/company/model/types';
import type { LucideIcon } from 'lucide-react';

interface AboutProps {
  aboutInfo: CompanyAbout | null;
}

export default function About({ aboutInfo }: AboutProps) {
  // 기본값 설정
  const strengths = aboutInfo?.strengths || [];
  const vision = aboutInfo?.vision || '';
  const values = aboutInfo?.values || [];
  const introduction = aboutInfo?.introduction || '';

  // Lucide 아이콘 동적 로드
  const getIconComponent = (iconName: string) => {
    if (!iconName || !(iconName in LucideIcons)) {
      return null;
    }
    return LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
  };

  return (
    <section id="about" className="bg-gray-50 py-24">
      <Container>
        <div className="flex flex-col gap-16">
          {/* 헤더 */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">회사소개</h2>
            {introduction ? (
              <div 
                className="text-xl text-gray-600 max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: introduction }}
              />
            ) : (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                도장설비 전문기업으로서 최고 품질의 제품과 서비스로 고객만족을 실현합니다
              </p>
            )}
          </div>

          {/* 강점 카드들 */}
          {strengths.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {strengths.map((strength, index) => {
                const IconComponent = getIconComponent(strength.icon);
                return (
                  <div
                    key={strength.id || index}
                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    {IconComponent && (
                      <div className="w-16 h-16 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] rounded-xl flex items-center justify-center mb-6">
                        <IconComponent className="text-white w-8 h-8" />
                      </div>
                    )}
                    <h3 className="text-gray-900 mb-3 text-xl font-normal">{strength.title}</h3>
                    <p className="text-gray-600">{strength.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* 기업 비전 및 핵심 가치 */}
          {(vision || values.length > 0) && (
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* 기업 비전 */}
                {vision && (
                  <div>
                    <h3 className="text-2xl font-normal text-gray-900 mb-6">기업 비전</h3>
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: vision }}
                    />
                  </div>
                )}

                {/* 핵심 가치 */}
                {values.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-normal text-gray-900 mb-6">핵심 가치</h3>
                    <div className="space-y-4">
                      {values.map((value, index) => (
                        <div key={value.id || index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-[#2CA7DB] rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="text-gray-900 mb-1 text-xl font-normal">{value.title}</h4>
                            <p className="text-gray-600 text-sm">{value.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

