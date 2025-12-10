'use client';

import { useState, useEffect, useMemo } from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import type { User } from '@/src/entities/user';
import { User as UserIcon, Mail } from 'lucide-react';
import { generateUserColor, rgbToCss } from '@/src/shared/lib/utils';

interface ProfileFormProps {
  user: User;
  onUpdate?: (data: { name: string }) => Promise<void>;
}

export default function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [name, setName] = useState(user.name || '');

  useEffect(() => {
    setName(user.name || '');
  }, [user]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (onUpdate) {
      onUpdate({ name: value });
    }
  };

  // provider를 한글명으로 변환
  const getProviderName = (provider: string | undefined | null): string => {
    switch (provider) {
      case 'google':
        return '구글';
      case 'naver':
        return '네이버';
      case 'kakao':
        return '카카오';
      case 'email':
        return '이메일';
      default:
        return provider || '이메일';
    }
  };

  // provider 아이콘 컴포넌트
  const getProviderIcon = (provider: string | undefined | null) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        );
      case 'naver':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path fill="#03C75A" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
          </svg>
        );
      case 'kakao':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path fill="#3C1E1E" d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.8 5.1 4.5 6.3l-1.2 4.5c-.1.3.2.5.4.3l5.1-2.7c.6.1 1.2.1 1.8.1 5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
          </svg>
        );
      case 'email':
        return <Mail className="w-4 h-4 text-[#4D4D4D]" />;
      default:
        return <Mail className="w-4 h-4 text-[#4D4D4D]" />;
    }
  };

  // provider 확인
  const provider = useMemo(() => user.metadata?.signup_provider || 'email', [user.metadata?.signup_provider]);
  const providerIcon = useMemo(() => getProviderIcon(provider), [provider]);

  return (
    <div className="space-y-6">
      <div>
        {/* <CardHeader className="px-0 pt-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-normal text-[#1A1A1A]">
            <UserIcon className="w-5 h-5" />
            프로필 정보
          </CardTitle>
          <CardDescription className="text-base text-[#4D4D4D] mt-2">
            기본 프로필 정보를 수정합니다
          </CardDescription>
        </CardHeader> */}
        <div className="space-y-6">
          {/* 프로필 아바타 */}
          <div className="flex items-start gap-6">
            {(() => {
              const displayName = name || user.name || user.email || 'U';
              // 사용자 ID를 기준으로 색상 생성
              const userColor = generateUserColor(user.id);
              const backgroundColor = rgbToCss(userColor);

              return (
                <div className="relative flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-full flex border border-gray-50/80 items-center justify-center text-white text-2xl font-normal"
                    style={{ backgroundColor }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  {/* 가입 방법 아이콘 표시 */}
                  <div
                    className={`absolute -top-1 -right-1 w-7 h-7 rounded-full shadow-md flex items-center justify-center ${provider === 'kakao' ? 'bg-[#FEE500]' : 'bg-white'
                      }`}
                  >
                    {providerIcon}
                  </div>
                </div>
              );
            })()}
            <div className="flex-1 pt-2">
              <p className="text-sm text-[#4D4D4D]">
                프로필 사진은 이름의 첫 글자로 표시됩니다
              </p>
            </div>
          </div>

          {/* 이름 입력 */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-normal text-[#1A1A1A]">
              이름
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="h-9 px-3 py-1 border border-[#E2E8F0] rounded-[10px] text-sm text-[#4D4D4D]"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 이메일 입력 (읽기 전용) */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-normal text-[#1A1A1A]">
              이메일
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="h-9 px-3 py-1 pl-10 border border-[#E2E8F0] rounded-[10px] text-sm text-[#4D4D4D] bg-white"
                placeholder="이메일"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4D4D4D]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.33}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
          </div>

          {/* 역할 입력 (비활성화) */}
          {/* <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-normal text-[#1A1A1A]">
              역할
            </label>
            <Input
              id="role"
              type="text"
              value={user.role === 'admin' ? '관리자' : '사용자'}
              disabled
              className="h-9 px-3 py-1 border border-[#E2E8F0] rounded-[10px] text-sm text-[#1A1A1A] bg-[#F4F6F8] opacity-50"
            />
          </div> */}
        </div>
      </div>
    </div>
  );
}

