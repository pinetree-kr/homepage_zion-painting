'use client';

import type { CompanyHistory } from '@/src/entities/company/model/types';

interface CompanyHistoryTabProps {
  histories: CompanyHistory[];
}

export default function CompanyHistoryTab({ histories }: CompanyHistoryTabProps) {
  if (histories.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">연혁 정보가 아직 등록되지 않았습니다.</p>
      </div>
    );
  }

  // 연도별로 그룹화 및 월별 정렬
  const groupedByYear = histories.reduce((acc, history) => {
    const year = history.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(history);
    return acc;
  }, {} as Record<string, CompanyHistory[]>);

  // 각 연도 내에서 월별로 정렬 (월이 없는 것은 맨 뒤로)
  Object.keys(groupedByYear).forEach((year) => {
    groupedByYear[year].sort((a, b) => {
      const monthA = a.month ? parseInt(a.month) : 999;
      const monthB = b.month ? parseInt(b.month) : 999;
      return monthB - monthA; // 내림차순 (12월 -> 1월)
    });
  });

  // 연도 내림차순 정렬
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => {
    const yearA = parseInt(a) || 0;
    const yearB = parseInt(b) || 0;
    return yearB - yearA;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* 타임라인 */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-12">
          {sortedYears.map((year, yearIndex) => {
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
                          <p className="text-gray-700 leading-relaxed">{history.content}</p>
                          {history.type && (
                            <span
                              className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                                history.type === 'cert'
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
  );
}
