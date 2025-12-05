'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import UserMenu from '@/src/widgets/user/ui/UserMenu';
import { FileIcon } from 'lucide-react';

// Icon Components
const Building2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12h12" />
    <path d="M6 16h12" />
    <path d="M6 8h12" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </svg>
);

const PackageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CalculatorIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const LayoutDashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const ServerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const UserCogIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <circle cx="19" cy="11" r="2" />
    <path d="M19 8v1" />
    <path d="M19 14v1" />
    <path d="M21.6 9.5l-.87.5" />
    <path d="M17.27 12l-.87.5" />
    <path d="M21.6 12.5l-.87-.5" />
    <path d="M17.27 10l-.87-.5" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

// interface BoardConnections {
//   noticeBoardCode: string | null;
//   inquireBoardCode: string | null;
//   pdsBoardCode: string | null;
//   quoteBoardCode: string | null;
//   reviewBoardCode: string | null;
// }

interface DefaultBoards {
  [key: string]: { id: string | null; name: string; display_order: number } | null;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  // boardConnections?: BoardConnections;
  defaultBoards?: DefaultBoards | null;
}

export default function AdminLayout({ children, defaultBoards }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['site-settings', 'customer-management', 'main-boards', 'system-management']);
  const pathname = usePathname();
  const router = useRouter();

  // 현재 경로에 따라 activeTab 결정
  const getActiveTab = useCallback(() => {
    if (pathname === '/admin/dashboard') return 'dashboard';
    if (pathname?.startsWith('/admin/site-settings')) {
      if (pathname.startsWith('/admin/site-settings/default')) return 'default-info';
      if (pathname.startsWith('/admin/site-settings/company')) return 'company-info';
      if (pathname.startsWith('/admin/site-settings/business')) return 'business-info';
      if (pathname.startsWith('/admin/site-settings/product')) return 'product-info';
      return 'default-info';
    }
    if (pathname?.startsWith('/admin/services')) {
      if (pathname === '/admin/services/members') return 'members';
      return 'members';
    }
    if (pathname?.startsWith('/admin/boards')) {
      // 게시판 연결 정보에 따라 활성 탭 결정
      const boardId = pathname.split('/admin/boards/')[1]?.split('/')[0];

      // if (boardCode === boardConnections?.noticeBoardCode) return 'notices';
      // if (boardCode === boardConnections?.inquireBoardCode) return 'qna';
      // if (boardCode === boardConnections?.quoteBoardCode) return 'quotes';
      // if (boardCode === boardConnections?.reviewBoardCode) return 'reviews';
      // if (boardCode === boardConnections?.pdsBoardCode) return 'pds';
      // TODO


      const defaultBoardKey = Object.entries(defaultBoards || {}).find(([key, board]: [string, { id: string | null; name: string; display_order: number } | null]) => {
        return board?.id === boardId;
      })?.[0] ?? null;

      if (defaultBoardKey) {
        return `main-board-${defaultBoardKey}`;
      }

      return `board-${boardId}`;
    }
    if (pathname?.startsWith('/admin/system')) {
      if (pathname === '/admin/system/administrators') return 'admin-management';
      if (pathname.startsWith('/admin/system/logs')) return 'logs';
      if (pathname.startsWith('/admin/system/boards')) return 'board-management';
      if (pathname === '/admin/system/board-connections') return 'board-management';
      return 'admin-management';
    }
    return null;
  }, [pathname]);

  const handleTabChange = useCallback((tab: string) => {
    const getBoardRoute = (boardCode: string | null, defaultRoute: string) => {
      if (boardCode) {
        return `/admin/boards/${boardCode}`;
      }
      return defaultRoute;
    };

    const routeMap: Record<string, string> = {
      'dashboard': '/admin/dashboard',
      'default-info': '/admin/site-settings/default/prologue',
      'company-info': '/admin/site-settings/company/introduction',
      'business-info': '/admin/site-settings/business/introduction',
      'product-info': '/admin/site-settings/product/introduction',
      'members': '/admin/services/members',
      'board-management': '/admin/system/boards/list',
      'admin-management': '/admin/system/administrators',
      'logs': '/admin/system/logs',
      // ...(defaultBoards ? Object.entries(defaultBoards).reduce((acc, [key, board]) => {
      //   if (board?.id) {
      //     acc[`main-board-${board.id}`] = `/admin/boards/${board.id}`;
      //     return acc;
      //   }
      //   return acc;
      // }, {} as Record<string, string>) : {}),
    };

    const route = routeMap[tab];
    if (route) {
      router.push(route);
    }
  }, [router, defaultBoards]);

  const toggleMenu = useCallback((menuId: string) => {
    setOpenMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  }, [setOpenMenus]);

  const menuStructure = useMemo(() => {
    // 주요게시판 메뉴 아이템 생성
    const mainBoardItems: Array<{ id: string; label: string; icon: any; route: string | null }> = [];

    if (defaultBoards) {
      const boardLabels: { [key: string]: string } = {
        notice: '공지사항',
        inquiry: 'Q&A',
        pds: '자료실',
        product: '제품',
      };

      const boardIcons: { [key: string]: any } = {
        notice: FileTextIcon,
        inquiry: MessageSquareIcon,
        pds: FileIcon,
        product: PackageIcon,
      };

      // default_boards의 각 항목을 메뉴 아이템으로 추가 (display_order 기준 정렬)
      Object.entries(defaultBoards)
        .sort(([, a], [, b]) => {
          const orderA = a?.display_order ?? 999;
          const orderB = b?.display_order ?? 999;
          return orderA - orderB;
        })
        .forEach(([key, board]) => {
          if (board) {
            // const boardCode = board.id ? boardIdToCode[board.id] : null;
            const boardName = board.name || boardLabels[key] || key;

            if (board.id) {
              // 연결된 게시판
              mainBoardItems.push({
                id: `main-board-${key}`,
                label: boardName,
                icon: boardIcons[key] || FileTextIcon,
                route: `/admin/boards/${board.id}`,
              });
            } else {
              // 연결되지 않은 게시판
              mainBoardItems.push({
                id: `main-board-${key}`,
                label: `${boardName} (연결안됨)`,
                icon: boardIcons[key] || FileTextIcon,
                route: `/admin/system/board-connections`,
              });
            }
          }
        });
    }

    return [
      {
        id: 'site-settings',
        label: '사이트설정',
        icon: SettingsIcon,
        items: [
          { id: 'default-info', label: '기본정보', icon: Building2Icon, route: '/admin/site-settings/default' },
          { id: 'company-info', label: '회사정보', icon: Building2Icon, route: '/admin/site-settings/company' },
          { id: 'business-info', label: '사업정보', icon: BriefcaseIcon, route: '/admin/site-settings/business' },
          { id: 'product-info', label: '제품정보', icon: PackageIcon, route: '/admin/site-settings/product' },
        ],
      },
      {
        id: 'customer-management',
        label: '서비스 관리',
        icon: MessageSquareIcon,
        items: [
          { id: 'members', label: '회원관리', icon: UsersIcon, route: '/admin/services/members' },
          { id: 'board-management', label: '게시판관리', icon: FileTextIcon, route: '/admin/system/boards/list' },
        ],
      },
      ...(mainBoardItems.length > 0 ? [{
        id: 'main-boards',
        label: '주요게시판',
        icon: FileTextIcon,
        items: mainBoardItems,
      }] : []),
      {
        id: 'system-management',
        label: '시스템관리',
        icon: ServerIcon,
        items: [
          { id: 'admin-management', label: '관리자', icon: ShieldIcon, route: '/admin/system/administrators' },
          { id: 'logs', label: '로그', icon: ActivityIcon, route: '/admin/system/logs' },
        ],
      },
    ];
  }, [defaultBoards]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-[73px]">
        <div className="flex items-center justify-between px-6 py-4 h-full">
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
            {/* 사용자 드롭다운 메뉴 */}
            <UserMenu isScrolled={false} />
          </div>
        </div>
      </header>

      <div className="flex pt-[73px] h-[calc(100vh)]">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 
          top-[73px] bottom-0 lg:top-[73px] lg:bottom-auto
          flex flex-col h-[calc(100vh-73px)] lg:h-full
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* 스크롤 가능한 메뉴 영역 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0 pb-4">
            <div className="mb-4">
              {/* <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center text-white shadow-lg mb-3">
                <Building2Icon className="h-6 w-6" />
              </div>
              <h3 className="text-gray-900 mb-1 font-semibold">시온 도장설비</h3> */}
              <p className="text-gray-500 text-sm">관리자모드</p>
            </div>

            <nav className="space-y-2">
              {/* 대시보드 메뉴 - 최상단 */}
              <Link
                href="/admin/dashboard"
                onClick={() => {
                  handleTabChange('dashboard');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-2 ${getActiveTab() === 'dashboard'
                  ? 'bg-[#1A2C6D] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <LayoutDashboardIcon className="h-4 w-4" />
                <span>대시보드</span>
              </Link>

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
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="space-y-1 mt-1 ml-4">
                        {menu.items.map((item) => {
                          const IconComponent = item.icon;
                          const isActive = getActiveTab() === item.id;
                          return (
                            item.route ? (
                              <Link
                                key={item.id}
                                href={item.route}
                                onClick={() => {
                                  handleTabChange(item.id);
                                  setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${isActive
                                  ? 'bg-[#1A2C6D] text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                              >
                                <IconComponent className="h-4 w-4" />
                                {item.label}
                              </Link>
                            ) : (
                              <div
                                key={item.id}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-gray-400 cursor-not-allowed"
                                title="게시판이 연결되지 않았습니다"
                              >
                                <IconComponent className="h-4 w-4" />
                                {item.label}
                              </div>
                            )
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* 관리자모드 나가기 버튼 - 사이드바 최하단 고정 */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HomeIcon className="h-4 w-4 flex-shrink-0" />
              <span>관리자모드 나가기</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full ml-0 lg:ml-0">
          {/* <div className="max-w-7xl mx-auto"> */}
          {children}
          {/* </div> */}
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

