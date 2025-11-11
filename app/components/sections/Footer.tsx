import Container from '../layout/Container';
import Image from 'next/image';

export default function Footer() {
  const companyLinks = [
    { label: '회사소개', href: '#' },
    { label: '사업분야', href: '#' },
    { label: '제품소개', href: '#' },
    { label: '오시는 길', href: '#' }
  ];

  const supportLinks = [
    { label: '공지사항', href: '#' },
    { label: 'Q&A', href: '#' },
    { label: '견적문의', href: '#' },
    { label: '갤러리', href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <Container>
        <div className="flex flex-col gap-12">
          {/* 메인 푸터 컨텐츠 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 로고 및 설명 */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-lg border-2 border-gray-700 p-3 inline-block mb-4 shadow-md">
                <Image
                  src="/logo-192.png"
                  alt="시온 페인팅"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-base text-gray-400 mb-6">
                최첨단 도장설비 기술로 산업 발전에 기여하는 기업
              </p>
              {/* 소셜 미디어 아이콘 */}
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#1A2C6D] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2Z" fill="currentColor"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* 회사정보 */}
            <div className="flex flex-col gap-4">
              <h5 className="text-base font-normal text-white mb-6">회사정보</h5>
              <ul className="flex flex-col gap-3">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-base text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 고객지원 */}
            <div className="flex flex-col gap-4">
              <h5 className="text-base font-normal text-white mb-6">고객지원</h5>
              <ul className="flex flex-col gap-3">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-base text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 연락처 */}
            <div className="flex flex-col gap-4">
              <h5 className="text-base font-normal text-white mb-6">연락처</h5>
              <ul className="flex flex-col gap-3 text-sm text-gray-400">
                <li>경기도 화성시 팔탄면 공장길 123</li>
                <li>도장설비 산업단지 내</li>
                <li className="pt-2">Tel: 031-123-4567</li>
                <li>Fax: 031-123-4568</li>
                <li>Email: coating@zion.com</li>
              </ul>
            </div>
          </div>

          {/* 하단 구분선 및 저작권 */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-base text-gray-400">
                © 2024 ZION. All rights reserved.
              </p>
              <div className="flex gap-4 text-sm text-gray-400">
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  이용약관
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  개인정보처리방침
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  이메일무단수집거부
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

