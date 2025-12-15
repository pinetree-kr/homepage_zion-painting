'use client';

import Image from 'next/image';
import type { OrganizationMember } from '@/src/entities/company/model/types';

interface CompanyOrganizationTabProps {
  members: OrganizationMember[];
}

export default function CompanyOrganizationTab({ members }: CompanyOrganizationTabProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">조직도 정보가 아직 등록되지 않았습니다.</p>
      </div>
    );
  }

  // display_order 기준으로 정렬 (이미 정렬되어 올 수도 있지만 확실하게)
  const sortedMembers = [...members].sort((a, b) => {
    return (a.display_order || 0) - (b.display_order || 0);
  });

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">조직 구성</h2>
      {sortedMembers.length > 0 ? (
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
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">조직 구성원 정보가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
