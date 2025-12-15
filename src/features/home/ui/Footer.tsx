import { Container } from '@/src/shared/ui';
import Image from 'next/image';
import type { ContactInfo } from '@/src/entities/contact/model/types';
import type { SiteSetting } from '@/src/entities/site-setting/model/types';

interface FooterProps {
  contactInfo?: ContactInfo | null;
  defaultBoards?: SiteSetting['default_boards'] | null;
}

// Social Media Icons (lucide-react 기반)
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

export default function Footer({ contactInfo, defaultBoards }: FooterProps) {
  // 회사정보 링크
  const companyLinks = [
    { label: '회사소개', href: '/about' },
    { label: '사업분야', href: '/business' },
    { label: '제품소개', href: '/products' },
    { label: '오시는 길', href: '/contact' },
  ];

  // 고객지원 링크 - default_boards에서 동적으로 생성
  const supportLinks = defaultBoards
    ? Object.entries(defaultBoards)
        .filter(([_, board]) => board && board.id) // id가 있는 게시판만 표시
        .sort(([_, a], [__, b]) => {
          const orderA = a?.display_order ?? 999;
          const orderB = b?.display_order ?? 999;
          return orderA - orderB;
        })
        .map(([_, board]) => ({
          label: board!.name || '게시판',
          href: `/boards/${board!.id}`,
        }))
    : [];

  // 법적 링크
  const legalLinks = [
    { label: '이용약관', href: '/terms/2025-12-11' },
    { label: '개인정보처리방침', href: '/privacy/2025-12-11' },
  ];

  const socialLinks = [
    { icon: FacebookIcon, href: '#' },
    { icon: TwitterIcon, href: '#' },
    { icon: InstagramIcon, href: '#' },
    { icon: YoutubeIcon, href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <Container>
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="bg-white rounded-lg border-2 border-gray-700 p-3 inline-block mb-4 shadow-md">
              <Image
                src="/logo-192.png"
                alt="시온"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-6">
              최첨단 도장설비 기술로 산업 발전에 기여하는 기업
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#1A2C6D] transition-colors"
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h5 className="text-white mb-6">회사정보</h5>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          {supportLinks.length > 0 && (
            <div>
              <h5 className="text-white mb-6">고객지원</h5>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h5 className="text-white mb-6">연락처</h5>
            <ul className="space-y-3 text-gray-400 text-sm">
              {contactInfo?.address ? (
                contactInfo.address.split('\n').map((line, index) => (
                  <li key={index}>{line}</li>
                ))
              ) : (
                <li>주소 정보가 없습니다</li>
              )}
              {contactInfo?.phone_primary && (
                <li className="pt-2">Tel: {contactInfo.phone_primary}</li>
              )}
              {contactInfo?.fax && (
                <li>Fax: {contactInfo.fax}</li>
              )}
              {contactInfo?.email && (
                <li>Email: {contactInfo.email}</li>
              )}
            </ul>
          </div>
          </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">
            © 2024 ZION. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            {legalLinks.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

