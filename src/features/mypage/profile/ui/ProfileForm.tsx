'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import type { User } from '@/src/entities/user';
import { User as UserIcon } from 'lucide-react';

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

  return (
    <Card className="border border-[#E2E8F0] rounded-2xl">
      <CardHeader className="px-6 pt-6 pb-0">
        <CardTitle className="flex items-center gap-2 text-base font-normal text-[#1A1A1A]">
          <UserIcon className="w-5 h-5" />
          프로필 정보
        </CardTitle>
        <CardDescription className="text-base text-[#4D4D4D] mt-2">
          기본 프로필 정보를 수정합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-6">
        <div className="space-y-6">
          {/* 프로필 아바타 */}
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center text-white text-2xl font-normal flex-shrink-0">
              {name.charAt(0) || user.name?.charAt(0) || 'U'}
            </div>
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
      </CardContent>
    </Card>
  );
}

