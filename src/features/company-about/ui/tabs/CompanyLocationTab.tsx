'use client';

import type { ContactInfo } from '@/src/entities/contact/model/types';

interface CompanyLocationTabProps {
  contactInfo: ContactInfo | null;
}

export default function CompanyLocationTab({ contactInfo }: CompanyLocationTabProps) {
  if (!contactInfo) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">연락처 정보가 아직 등록되지 않았습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">오시는 길</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 연락처 정보 */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">연락처 정보</h3>

          {/* 주소 */}
          {contactInfo.address && (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F4F6F8] rounded-xl flex items-center justify-center flex-shrink-0">
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
              <div className="w-12 h-12 bg-[#F4F6F8] rounded-xl flex items-center justify-center flex-shrink-0">
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
              <div className="w-12 h-12 bg-[#F4F6F8] rounded-xl flex items-center justify-center flex-shrink-0">
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
              <div className="w-12 h-12 bg-[#F4F6F8] rounded-xl flex items-center justify-center flex-shrink-0">
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
          {contactInfo.map_url ? (
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg">
              <iframe
                src={contactInfo.map_url}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl h-[400px] flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-500">지도 정보가 없습니다</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
