import { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Business } from './components/Business';
import { Products } from './components/Products';
import { Contact } from './components/Contact';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { SupportPage } from './components/support/SupportPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { CompanyInfo } from './components/admin/CompanyInfo';
import { BusinessInfo } from './components/admin/BusinessInfo';
import { ProductsAdmin } from './components/admin/ProductsAdmin';
import { ContactInfo } from './components/admin/ContactInfo';
import { BoardManagement } from './components/admin/BoardManagement';
import { UserSettings } from './components/admin/UserSettings';
import { MemberManagement } from './components/admin/MemberManagement';
import { AdminManagement } from './components/admin/AdminManagement';
import { LogManagement } from './components/admin/LogManagement';
import { ResourceMonitor } from './components/admin/ResourceMonitor';
import { getCurrentUser, isAdmin, updateUser } from './utils/auth';
import { User } from './types';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showSignUpPage, setShowSignUpPage] = useState(false);
  const [showSupportPage, setShowSupportPage] = useState(false);
  const [supportSection, setSupportSection] = useState<string>('notice');
  const [activeAdminTab, setActiveAdminTab] = useState('company-info');
  const [showUserSettings, setShowUserSettings] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowLoginPage(false);
  };

  const handleSignUpSuccess = (user: User) => {
    setCurrentUser(user);
    setShowSignUpPage(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginPage(false);
    setShowSignUpPage(false);
    setShowSupportPage(false);
    setShowUserSettings(false);
  };

  const handleUserUpdate = (updates: Partial<User> & { currentPassword?: string; newPassword?: string }) => {
    if (!currentUser) return;

    try {
      const updatedUser = updateUser(currentUser.id, updates);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        setShowUserSettings(false);
        setActiveAdminTab('company-info');
        toast.success('사용자 정보가 성공적으로 업데이트되었습니다');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '업데이트 중 오류가 발생했습니다');
    }
  };

  // Show login page
  if (showLoginPage) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignUp={() => {
          setShowLoginPage(false);
          setShowSignUpPage(true);
        }}
        onClose={() => setShowLoginPage(false)}
      />
    );
  }

  // Show sign up page
  if (showSignUpPage) {
    return (
      <SignUpPage
        onSignUpSuccess={handleSignUpSuccess}
        onSwitchToLogin={() => {
          setShowSignUpPage(false);
          setShowLoginPage(true);
        }}
        onClose={() => setShowSignUpPage(false)}
      />
    );
  }

  // Show support page
  if (showSupportPage) {
    return (
      <SupportPage
        currentUser={currentUser}
        initialSection={supportSection}
        onBack={() => setShowSupportPage(false)}
        onLoginClick={() => {
          setShowSupportPage(false);
          setShowLoginPage(true);
        }}
      />
    );
  }

  // If user is admin, show admin panel
  if (currentUser && isAdmin(currentUser)) {
    return (
      <>
        <AdminLayout
          user={currentUser}
          activeTab={activeAdminTab}
          onTabChange={setActiveAdminTab}
          onLogout={handleLogout}
          onSettingsClick={() => setShowUserSettings(true)}
        >
          {showUserSettings ? (
            <UserSettings
              user={currentUser}
              onSave={handleUserUpdate}
              onCancel={() => setShowUserSettings(false)}
            />
          ) : (
            <>
              {activeAdminTab === 'company-info' && <CompanyInfo />}
              {activeAdminTab === 'business-info' && <BusinessInfo />}
              {activeAdminTab === 'products-admin' && <ProductsAdmin />}
              {activeAdminTab === 'contact-info' && <ContactInfo />}
              {activeAdminTab === 'members' && <MemberManagement />}
              {activeAdminTab === 'notice' && (
                <BoardManagement
                  type="notice"
                  title="공지사항 관리"
                  description="공지사항을 작성하고 관리합니다"
                />
              )}
              {activeAdminTab === 'qna' && (
                <BoardManagement
                  type="qna"
                  title="Q&A 관리"
                  description="고객 질문에 답변하고 관리합니다"
                />
              )}
              {activeAdminTab === 'quote' && (
                <BoardManagement
                  type="quote"
                  title="견적문의 관리"
                  description="견적 요청을 확인하고 관리합니다"
                />
              )}
              {activeAdminTab === 'review' && (
                <BoardManagement
                  type="review"
                  title="고객후기 관리"
                  description="고객 후기를 관리합니다"
                />
              )}
              {activeAdminTab === 'admin-management' && <AdminManagement />}
              {activeAdminTab === 'logs' && <LogManagement />}
              {activeAdminTab === 'resources' && <ResourceMonitor />}
            </>
          )}
        </AdminLayout>
        <Toaster />
      </>
    );
  }

  // Regular user or not logged in - show public site
  return (
    <>
      <div className="min-h-screen bg-white">
        <Navigation 
          currentUser={currentUser}
          onLoginClick={() => setShowLoginPage(true)}
          onLogoutClick={handleLogout}
          onSupportClick={(section) => {
            if (section) {
              setSupportSection(section);
            }
            setShowSupportPage(true);
          }}
        />
        <Hero />
        <About />
        <Business />
        <Products />
        <Contact currentUser={currentUser} onLoginClick={() => setShowLoginPage(true)} />
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
