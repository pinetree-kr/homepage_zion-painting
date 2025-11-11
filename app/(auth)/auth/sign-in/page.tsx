'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { login } from '@/app/lib/auth';
import { Input } from '@/app/components/ui/Input';
import { Label } from '@/app/components/ui/Label';
import { Checkbox } from '@/app/components/ui/Checkbox';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(email, password);
    if (user) {
      router.push('/');
      router.refresh();
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Image/Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==")`,
          }}
        />
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="text-center max-w-md">
            <div className="mb-8 flex justify-center">
              <div className="bg-white rounded-xl border-2 border-white/30 p-4 shadow-lg backdrop-blur-sm">
                <Image
                  src="/logo-192.png"
                  alt="시온"
                  width={80}
                  height={80}
                  className="h-20 w-auto"
                />
              </div>
            </div>
            <h1 className="text-white text-4xl mb-4">Welcome Back</h1>
            <p className="text-white/90 text-lg mb-8">
              시온 도장설비 관리 시스템에 오신 것을 환영합니다
            </p>
            <div className="space-y-4 text-left">
              {[
                { icon: '🛡️', text: 'Secure authentication' },
                { icon: '⚡', text: 'Fast and reliable' },
                { icon: '🏆', text: 'Premium experience' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>돌아가기</span>
        </Link>
        
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-gray-900 text-2xl font-bold mb-2">로그인</h2>
            <p className="text-gray-600">이메일과 비밀번호를 입력하세요</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Test Accounts Info */}
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <p className="text-sm text-teal-900 mb-2 font-medium">테스트 계정:</p>
            <p className="text-xs text-teal-700">관리자: admin@zion.com / admin123</p>
            <p className="text-xs text-teal-700">사용자: user@zion.com / user123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
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
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
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
                  onCheckedChange={setRememberMe}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 leading-none cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-md px-4 py-2 flex items-center justify-center gap-2 transition-colors"
            >
              Sign In
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/sign-up" className="text-teal-600 hover:text-teal-700 font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

