import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import logo from 'figma:asset/589b5855ead2bc75a0e850928a6101fe32d8cd5c.png';

export function Footer() {
  const footerLinks = {
    company: [
      { label: '회사소개', href: '#about' },
      { label: '사업분야', href: '#business' },
      { label: '제품소개', href: '#products' },
      { label: '오시는 길', href: '#contact' },
    ],
    support: [
      { label: '공지사항', href: '#support' },
      { label: 'Q&A', href: '#support' },
      { label: '견적문의', href: '#support' },
      { label: '갤러리', href: '#support' },
    ],
    legal: [
      { label: '이용약관', href: '#' },
      { label: '개인정보처리방침', href: '#' },
      { label: '이메일무단수집거부', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Youtube, href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="bg-white rounded-lg border-2 border-gray-700 p-3 inline-block mb-4 shadow-md">
              <img src={logo} alt="시온" className="h-10 w-auto" />
            </div>
            <p className="text-gray-400 mb-6">
              최첨단 도장설비 기술로 산업 발전에 기여하는 기업
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#1A2C6D] transition-colors"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h5 className="text-white mb-6">회사정보</h5>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h5 className="text-white mb-6">고객지원</h5>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h5 className="text-white mb-6">연락처</h5>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>경기도 화성시 팔탄면 공장길 123</li>
              <li>도장설비 산업단지 내</li>
              <li className="pt-2">Tel: 031-123-4567</li>
              <li>Fax: 031-123-4568</li>
              <li>Email: coating@zion.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">
            © 2024 ZION. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            {footerLinks.legal.map((link, index) => (
              <a key={link.label} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
