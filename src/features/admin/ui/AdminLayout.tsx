'use client';

import { useState } from 'react';
import { User } from '@/src/features/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Icon Components
const Building2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12h12"/>
    <path d="M6 16h12"/>
    <path d="M6 8h12"/>
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    <rect width="20" height="14" x="2" y="6" rx="2"/>
  </svg>
);

const PackageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="M10 9H8"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
  </svg>
);

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CalculatorIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="16" height="20" x="4" y="2" rx="2"/>
    <line x1="8" x2="16" y1="6" y2="6"/>
    <line x1="16" x2="16" y1="14" y2="18"/>
    <path d="M16 10h.01"/>
    <path d="M12 10h.01"/>
    <path d="M8 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M8 14h.01"/>
    <path d="M12 18h.01"/>
    <path d="M8 18h.01"/>
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const ServerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
    <line x1="6" x2="6.01" y1="6" y2="6"/>
    <line x1="6" x2="6.01" y1="18" y2="18"/>
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 6 6 18"/>
    <path d="M6 6l12 12"/>
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

const UserCogIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <circle cx="19" cy="11" r="2"/>
    <path d="M19 8v1"/>
    <path d="M19 14v1"/>
    <path d="M21.6 9.5l-.87.5"/>
    <path d="M17.27 12l-.87.5"/>
    <path d="M21.6 12.5l-.87-.5"/>
    <path d="M17.27 10l-.87-.5"/>
  </svg>
);

interface AdminLayoutProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onSettingsClick: () => void;
  children: React.ReactNode;
}

export default function AdminLayout({ user, activeTab, onTabChange, onLogout, onSettingsClick, children }: AdminLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['basic-info', 'customer-management', 'system-management']);

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuStructure = [
    {
      id: 'basic-info',
      label: '기본정보',
      icon: Building2Icon,
      items: [
        { id: 'company-info', label: '회사 정보', icon: Building2Icon, route: '/admin/info/company' },
        { id: 'business-info', label: '사업소개', icon: BriefcaseIcon, route: '/admin/info/business' },
        { id: 'products-admin', label: '제품소개', icon: PackageIcon, route: '/admin/info/products' },
        { id: 'contact-info', label: '연락정보', icon: PhoneIcon, route: '/admin/info/contacts' },
      ],
    },
    {
      id: 'customer-management',
      label: '고객관리',
      icon: MessageSquareIcon,
      items: [
        { id: 'members', label: '회원관리', icon: UsersIcon, route: '/admin/customer/members' },
        { id: 'notice', label: '공지사항', icon: FileTextIcon, route: '/admin/customer/notices' },
        { id: 'qna', label: 'Q&A', icon: MessageSquareIcon, route: '/admin/customer/qna' },
        { id: 'quote', label: '견적문의', icon: CalculatorIcon, route: '/admin/customer/estimates' },
        { id: 'review', label: '고객후기', icon: StarIcon, route: '/admin/customer/reviews' },
      ],
    },
    {
      id: 'system-management',
      label: '시스템관리',
      icon: ServerIcon,
      items: [
        { id: 'admin-management', label: '관리자', icon: ShieldIcon, route: '/admin/system/administrators' },
        { id: 'logs', label: '로그', icon: ActivityIcon, route: '/admin/system/logs' },
        { id: 'resources', label: '리소스', icon: ServerIcon, route: '/admin/system/resources' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-[#F4F6F8] rounded-lg border-2 border-gray-300 p-2 shadow-sm">
                <Image
                  src="/logo-192.png"
                  alt="시온"
                  width={24}
                  height={24}
                  className="h-6 w-auto"
                />
              </div>
              <div>
                <h2 className="text-gray-900 text-lg font-semibold">시온 관리자</h2>
                <p className="text-gray-500 text-sm">Admin Panel</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-gray-900 text-sm font-medium">{user.name}</p>
              <p className="text-gray-500 text-xs">{user.email}</p>
            </div>
            
            {/* 사용자 드롭다운 메뉴 */}
            <div className="relative group">
              <button className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                <span className="text-sm font-medium">{user.name.charAt(0)}</span>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  <div className="px-2 py-1.5 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={onSettingsClick}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <UserCogIcon className="h-4 w-4" />
                    사용자 정보 수정
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 mt-[73px] lg:mt-0 overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center text-white shadow-lg mb-3">
                <Building2Icon className="h-6 w-6" />
              </div>
              <h3 className="text-gray-900 mb-1 font-semibold">시온 도장설비</h3>
              <p className="text-gray-500 text-sm">관리자 대시보드</p>
            </div>

            <nav className="space-y-2">
              {menuStructure.map((menu) => {
                const isOpen = openMenus.includes(menu.id);
                return (
                  <div key={menu.id}>
                    <button
                      onClick={() => toggleMenu(menu.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <menu.icon className="h-4 w-4" />
                        <span>{menu.label}</span>
                      </div>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="space-y-1 mt-1 ml-4">
                        {menu.items.map((item) => {
                          const IconComponent = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <Link
                              key={item.id}
                              href={item.route}
                              onClick={() => {
                                onTabChange(item.id);
                                setIsSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-[#1A2C6D] text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <IconComponent className="h-4 w-4" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

