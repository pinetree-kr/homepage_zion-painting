'use client';

import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import type { CompanyAbout } from '@/src/entities/company/model/types';
import type { CompanyHistory } from '@/src/entities/company/model/types';
import type { OrganizationMember } from '@/src/entities/company/model/types';
import type { ContactInfo } from '@/src/entities/contact/model/types';
import type { LucideIcon } from 'lucide-react';
import { Container } from '@/src/shared/ui';
import MapDisplay from '@/src/features/contact/ui/MapDisplay';

interface CompanyAboutSectionsProps {
  aboutInfo: CompanyAbout | null;
  histories: CompanyHistory[];
  organizationMembers: OrganizationMember[];
  contactInfo: ContactInfo | null;
  mapApiKeys: {
    kakao: string | null;
    naver: { clientId: string | null; clientSecret: string | null };
  };
}

export default function CompanyAboutSections({
  aboutInfo,
  histories,
  organizationMembers,
  contactInfo,
  mapApiKeys,
}: CompanyAboutSectionsProps) {
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

  // 연혁 데이터 처리
  const groupedByYear = histories.reduce((acc, history) => {
    const year = history.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(history);
    return acc;
  }, {} as Record<string, CompanyHistory[]>);

  Object.keys(groupedByYear).forEach((year) => {
    groupedByYear[year].sort((a, b) => {
      const monthA = a.month ? parseInt(a.month) : 999;
      const monthB = b.month ? parseInt(b.month) : 999;
      return monthB - monthA;
    });
  });

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => {
    const yearA = parseInt(a) || 0;
    const yearB = parseInt(b) || 0;
    return yearB - yearA;
  });

  // 조직도 정렬
  const sortedMembers = [...organizationMembers].sort((a, b) => {
    return (a.display_order || 0) - (b.display_order || 0);
  });

  return (
    <div className="pb-24">
      {/* 회사개요 섹션 - 회사 소개글이 있을 때만 표시 */}
      {introduction && (
        <section id="overview" className="scroll-mt-[137px] min-h-[300px] py-12">
          <Container>
            <div className="space-y-16">
              {/* 회사 소개글 */}
              <div>
                <div
                  className="text-gray-700 ck-content"
                  dangerouslySetInnerHTML={{ __html: introduction }}
                />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 대표 인사말 섹션 */}
      {greetings && (
        <section id="greetings" className="bg-gray-50 scroll-mt-[137px] min-h-[300px] py-12">
          <Container>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">대표 인사말</h2>
              <div
                className="max-w-none text-gray-700 ck-content"
                dangerouslySetInnerHTML={{ __html: greetings }}
              />
            </div>
          </Container>
        </section>
      )}

      {/* 연혁 섹션 */}
      {histories.length > 0 && (
        <section id="history" className="bg-gray-50 min-h-[300px] py-12 scroll-mt-[137px]">
          <Container>
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">연혁</h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* 타임라인 */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                <div className="space-y-12">
                  {sortedYears.map((year) => {
                    const yearHistories = groupedByYear[year];
                    return (
                      <div key={year} className="relative">
                        {/* 연도 마커 */}
                        <div className="flex items-center mb-6">
                          <div className="absolute left-0 w-16 h-16 bg-[#1A2C6D] rounded-full flex items-center justify-center z-10 shadow-lg">
                            <span className="text-white font-bold text-lg">{year}</span>
                          </div>
                          <div className="ml-24">
                            <h3 className="text-2xl font-bold text-gray-900">{year}년</h3>
                          </div>
                        </div>

                        {/* 해당 연도의 연혁 목록 */}
                        <div className="ml-24 space-y-6">
                          {yearHistories.map((history, index) => (
                            <div
                              key={history.id || index}
                              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-4">
                                {history.month && (
                                  <div className="flex-shrink-0">
                                    <span className="inline-block px-3 py-1 bg-[#2CA7DB] text-white text-sm font-medium rounded-full">
                                      {history.month}월
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-gray-700 ck-content">{history.content}</p>
                                  {history.type && (
                                    <span
                                      className={`inline-block mt-2 px-2 py-1 text-xs rounded ${history.type === 'cert'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                        }`}
                                    >
                                      {history.type === 'cert' ? '인증' : '사업'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 조직도 섹션 */}
      {sortedMembers.length > 0 && (
        <section id="organization" className="scroll-mt-[137px] min-h-[300px] py-12">
          <Container>
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">조직 구성</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedMembers.map((member, index) => (
                <div
                  key={member.id || index}
                  className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all hover:border-[#2CA7DB]"
                >
                  {/* 프로필 이미지 */}
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-100">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] text-white text-3xl font-bold">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* 이름 */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>

                  {/* 직책 */}
                  <p className="text-gray-600">{member.title || '직책 정보 없음'}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 오시는 길 섹션 */}
      {contactInfo && (
        <section id="location" className="bg-gray-50 min-h-[300px] py-12 scroll-mt-[137px]">
          <Container>
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">오시는 길</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 연락처 정보 */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">연락처 정보</h3>

                {/* 주소 */}
                {contactInfo.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                          stroke="#1A2C6D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                          stroke="#1A2C6D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-normal text-gray-900 mb-1">주소</h4>
                      <p className="text-base text-gray-600 whitespace-pre-line">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* 전화번호 */}
                {(contactInfo.phone_primary || contactInfo.phone_secondary) && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C9.4 21 0 11.6 0 0.08C0 -0.52 0.48 -1 1.08 -1H4.08C4.68 -1 5.16 -0.52 5.16 0.08C5.16 1.08 5.28 2.04 5.52 2.96C5.64 3.4 5.56 3.88 5.24 4.24L3.52 6.04C4.48 8.6 6.4 10.52 8.96 11.48L10.76 9.76C11.12 9.44 11.6 9.36 12.04 9.48C12.96 9.72 13.92 9.84 14.92 9.84C15.52 9.84 16 10.32 16 10.92V13.92C16 14.52 15.52 15 14.92 15Z"
                          stroke="#1A2C6D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-normal text-gray-900 mb-1">전화번호</h4>
                      {contactInfo.phone_primary && (
                        <p className="text-base text-gray-600">대표: {contactInfo.phone_primary}</p>
                      )}
                      {contactInfo.phone_secondary && (
                        <p className="text-base text-gray-600">담당자: {contactInfo.phone_secondary}</p>
                      )}
                      {contactInfo.fax && (
                        <p className="text-base text-gray-600">팩스: {contactInfo.fax}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 이메일 */}
                {contactInfo.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                          stroke="#1A2C6D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 6L12 13L2 6"
                          stroke="#1A2C6D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-normal text-gray-900 mb-1">이메일</h4>
                      <p className="text-base text-gray-600">{contactInfo.email}</p>
                    </div>
                  </div>
                )}

                {/* 영업시간 */}
                {contactInfo.business_hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#1A2C6D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 6V12L16 14"
                          stroke="#1A2C6D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-normal text-gray-900 mb-1">영업시간</h4>
                      <p className="text-base text-gray-600 whitespace-pre-line">
                        {contactInfo.business_hours}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 지도 */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">위치</h3>
                <MapDisplay 
                  maps={contactInfo.maps || null} 
                  address={contactInfo.address || null}
                  mapApiKeys={mapApiKeys}
                />
              </div>


            </div>
          </Container>
        </section>
      )
      }
    </div >
  );
}
