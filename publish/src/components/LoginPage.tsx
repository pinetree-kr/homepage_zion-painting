import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Shield, Zap, Award, ArrowLeft } from 'lucide-react';
import { login } from '../utils/auth';
import { User } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import logo from 'figma:asset/589b5855ead2bc75a0e850928a6101fe32d8cd5c.png';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToSignUp: () => void;
  onClose: () => void;
}

export function LoginPage({ onLoginSuccess, onSwitchToSignUp, onClose }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(email, password);
    if (user) {
      onLoginSuccess(user);
      onClose();
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Image/Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            <div className="mb-8 flex justify-center">
              <div className="bg-white rounded-xl border-2 border-white/30 p-4 shadow-lg backdrop-blur-sm">
                <img src={logo} alt="시온" className="h-20 w-auto" />
              </div>
            </div>
            <h1 className="text-white text-4xl mb-4">Welcome Back</h1>
            <p className="text-white/90 text-lg mb-8">
              시온 도장설비 관리 시스템에 오신 것을 환영합니다
            </p>
            <div className="space-y-4 text-left">
              {[
                { icon: Shield, text: 'Secure authentication' },
                { icon: Zap, text: 'Fast and reliable' },
                { icon: Award, text: 'Premium experience' },
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/90">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>돌아가기</span>
        </button>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-gray-900 mb-2">로그인</h2>
            <p className="text-muted-foreground">이메일과 비밀번호를 입력하세요</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Test Accounts Info */}
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <p className="text-sm text-teal-900 mb-2">테스트 계정:</p>
            <p className="text-xs text-teal-700">관리자: admin@zion.com / admin123</p>
            <p className="text-xs text-teal-700">사용자: user@zion.com / user123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mail@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              size="lg"
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-teal-600 hover:text-teal-700"
              >
                Sign Up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
