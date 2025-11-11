import { useState } from 'react';
import { User } from '../../types';
import { 
  Building2,
  Briefcase,
  Package,
  Phone,
  FileText,
  MessageSquare,
  Calculator,
  Star,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
  UserCog,
  Users,
  Shield,
  Activity,
  Server
} from 'lucide-react';
import { logout } from '../../utils/auth';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import logo from 'figma:asset/589b5855ead2bc75a0e850928a6101fe32d8cd5c.png';

interface AdminLayoutProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onSettingsClick: () => void;
  children: React.ReactNode;
}

export function AdminLayout({ user, activeTab, onTabChange, onLogout, onSettingsClick, children }: AdminLayoutProps) {
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
      icon: Building2,
      items: [
        { id: 'company-info', label: '회사 정보', icon: Building2 },
        { id: 'business-info', label: '사업소개', icon: Briefcase },
        { id: 'products-admin', label: '제품소개', icon: Package },
        { id: 'contact-info', label: '연락정보', icon: Phone },
      ],
    },
    {
      id: 'customer-management',
      label: '고객관리',
      icon: MessageSquare,
      items: [
        { id: 'members', label: '회원관리', icon: Users },
        { id: 'notice', label: '공지사항', icon: FileText },
        { id: 'qna', label: 'Q&A', icon: MessageSquare },
        { id: 'quote', label: '견적문의', icon: Calculator },
        { id: 'review', label: '고객후기', icon: Star },
      ],
    },
    {
      id: 'system-management',
      label: '시스템관리',
      icon: Settings,
      items: [
        { id: 'admin-management', label: '관리자', icon: Shield },
        { id: 'logs', label: '로그', icon: Activity },
        { id: 'resources', label: '리소스', icon: Server },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="bg-white border-b border-border fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-[#F4F6F8] rounded-lg border-2 border-gray-300 p-2 shadow-sm">
                <img src={logo} alt="시온" className="h-6 w-auto" />
              </div>
              <div>
                <h2 className="text-gray-900">시온 관리자</h2>
                <p className="text-muted-foreground text-sm">Admin Panel</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-gray-900 text-sm">{user.name}</p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
            
            {/* 사용자 드롭다운 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1A2C6D] focus:ring-offset-2">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB]">
                    <AvatarFallback className="bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>사용자 정보 수정</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-border transform transition-transform duration-300 mt-[73px] lg:mt-0 overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center text-white shadow-lg mb-3">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-gray-900 mb-1">시온 도장설비</h3>
              <p className="text-muted-foreground text-sm">관리자 대시보드</p>
            </div>

            <nav className="space-y-2">
              {menuStructure.map((menu) => (
                <Collapsible
                  key={menu.id}
                  open={openMenus.includes(menu.id)}
                  onOpenChange={() => toggleMenu(menu.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <menu.icon className="h-4 w-4" />
                        <span>{menu.label}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openMenus.includes(menu.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {menu.items.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? 'default' : 'ghost'}
                        className="w-full justify-start pl-10"
                        onClick={() => {
                          onTabChange(item.id);
                          setIsSidebarOpen(false);
                        }}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
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
