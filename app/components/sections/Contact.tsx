'use client';

import { useState } from 'react';
import Container from '../layout/Container';
import Card from '../ui/Card';

export default function Contact() {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 로그인 체크 및 문의 제출 로직
    alert('문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
    setMessage('');
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <Container>
        <div className="flex flex-col gap-16">
          {/* 헤더 */}
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-4xl font-bold text-[#101828]">문의하기</h2>
            <p className="text-xl text-[#4A5565] text-center max-w-3xl">
              도장설비에 대한 문의사항이 있으시면 언제든지 연락주세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 연락처 정보 */}
            <div className="flex flex-col gap-8">
              <h3 className="text-2xl font-normal text-[#101828]">연락처 정보</h3>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F4F6F8] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#1A2C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 6L12 13L2 6" stroke="#1A2C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-normal text-[#101828] mb-1">이메일</h4>
                    <p className="text-base text-[#4A5565]">coating@zion.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F4F6F8] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C9.4 21 0 11.6 0 0.08C0 -0.52 0.48 -1 1.08 -1H4.08C4.68 -1 5.16 -0.52 5.16 0.08C5.16 1.08 5.28 2.04 5.52 2.96C5.64 3.4 5.56 3.88 5.24 4.24L3.52 6.04C4.48 8.6 6.4 10.52 8.96 11.48L10.76 9.76C11.12 9.44 11.6 9.36 12.04 9.48C12.96 9.72 13.92 9.84 14.92 9.84C15.52 9.84 16 10.32 16 10.92V13.92C16 14.52 15.52 15 14.92 15Z" stroke="#1A2C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-normal text-[#101828] mb-1">전화번호</h4>
                    <p className="text-base text-[#4A5565]">대표: 031-123-4567</p>
                    <p className="text-sm text-[#4A5565]">담당자: 010-1234-5678</p>
                    <p className="text-sm text-[#4A5565]">팩스: 031-123-4568</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F4F6F8] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#1A2C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#1A2C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-normal text-[#101828] mb-1">본사 주소</h4>
                    <p className="text-base text-[#4A5565]">
                      경기도 화성시 팔탄면 공장길 123
                      <br />
                      도장설비 산업단지 내
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F4F6F8] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#1A2C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6V12L16 14" stroke="#1A2C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-normal text-[#101828] mb-1">영업시간</h4>
                    <p className="text-base text-[#4A5565]">평일: 09:00 - 18:00</p>
                    <p className="text-sm text-[#4A5565]">토·일·공휴일 휴무</p>
                  </div>
                </div>
              </div>

              {/* 지도 플레이스홀더 */}
              <div className="bg-[#E5E7EB] rounded-2xl h-64 flex items-center justify-center mt-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#99A1AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#99A1AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* 빠른 문의 폼 */}
            <Card className="p-8 bg-[#F9FAFB]">
              <h3 className="text-2xl font-normal text-[#101828] mb-6">빠른 문의</h3>
              
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#99A1AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="#99A1AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-base text-[#4A5565] text-center">
                  문의를 남기시려면 로그인이 필요합니다
                </p>
                <button className="px-6 py-3 bg-[#1A2C6D] text-white rounded-xl hover:bg-[#15204f] transition-colors">
                  로그인하기
                </button>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}

