import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as UserIcon, ChevronDown, Bell, MessageSquare, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import logo from 'figma:asset/589b5855ead2bc75a0e850928a6101fe32d8cd5c.png';

interface NavigationProps {
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onSupportClick?: (section?: string) => void;
}

export function Navigation({ currentUser, onLoginClick, onLogoutClick, onSupportClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSupportSubmenu, setShowSupportSubmenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: '회사소개', href: '#about', type: 'scroll' as const },
    { label: '사업소개', href: '#business', type: 'scroll' as const },
    { label: '제품소개', href: '#products', type: 'scroll' as const },
    { label: '문의', href: '#contact', type: 'scroll' as const },
  ];

  const supportSubMenuItems = [
    { label: '공지사항', icon: Bell, section: 'notice' },
    { label: 'Q&A', icon: MessageSquare, section: 'qna' },
    { label: '내 문의내역', icon: FileText, section: 'myinquiry' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.type === 'scroll') {
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  const handleSupportClick = (section?: string) => {
    if (onSupportClick) {
      onSupportClick(section);
      setIsMobileMenuOpen(false);
      setShowSupportSubmenu(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <div className="bg-white rounded-lg border-2 border-gray-200 p-2 shadow-sm">
                <img src={logo} alt="시온" className="h-8 w-auto" />
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleNavClick(item)}
                  className={`transition-colors duration-300 hover:text-blue-600 ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              
              {/* 고객센터 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * navItems.length }}
                    className={`flex items-center gap-1 transition-colors duration-300 hover:text-blue-600 ${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}
                  >
                    고객센터
                    <ChevronDown size={16} />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {supportSubMenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.section}
                      onClick={() => handleSupportClick(item.section)}
                      className="cursor-pointer"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 로그인/사용자 메뉴 */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isScrolled 
                          ? 'bg-gray-100 hover:bg-gray-200' 
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <UserIcon size={16} className={isScrolled ? 'text-gray-700' : 'text-white'} />
                      <span className={isScrolled ? 'text-gray-700' : 'text-white'}>
                        {currentUser.name}
                      </span>
                      <ChevronDown size={16} className={isScrolled ? 'text-gray-700' : 'text-white'} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={onLogoutClick} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>로그아웃</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={onLoginClick}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isScrolled 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  로그인
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-0 z-40 bg-white md:hidden overflow-y-auto"
          >
            <div className="flex flex-col items-center justify-center min-h-full py-20 space-y-6">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleNavClick(item)}
                  className="text-2xl text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </motion.button>
              ))}
              
              {/* 고객센터 모바일 서브메뉴 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * navItems.length }}
                className="flex flex-col items-center space-y-4"
              >
                <button
                  onClick={() => setShowSupportSubmenu(!showSupportSubmenu)}
                  className="text-2xl text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  고객센터
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${showSupportSubmenu ? 'rotate-180' : ''}`}
                  />
                </button>
                
                <AnimatePresence>
                  {showSupportSubmenu && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col items-center space-y-3"
                    >
                      {supportSubMenuItems.map((item) => (
                        <button
                          key={item.section}
                          onClick={() => handleSupportClick(item.section)}
                          className="text-lg text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                          <item.icon size={18} />
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 로그인/사용자 메뉴 모바일 */}
              {currentUser ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (navItems.length + 1) }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-lg text-xl"
                  >
                    <UserIcon size={20} />
                    <span>{currentUser.name}</span>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (navItems.length + 2) }}
                    onClick={() => {
                      onLogoutClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-6 py-3 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xl flex items-center gap-2"
                  >
                    <LogOut size={20} />
                    로그아웃
                  </motion.button>
                </>
              ) : (
                <motion.button
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (navItems.length + 1) }}
                  onClick={() => {
                    onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-6 py-3 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xl"
                >
                  로그인
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
