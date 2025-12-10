'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { createAdminAccount as createAdminAccountSetup } from '../api/setup-actions';

interface SetupFormProps {
  /** 모달에서 사용할 경우 true */
  isModal?: boolean;
  /** 성공 시 콜백 함수 (모달에서 사용) */
  onSuccess?: () => void;
  /** 취소 시 콜백 함수 (모달에서 사용) */
  onCancel?: () => void;
  /** 초기 설정 페이지에서 사용할 경우 true (기본값: false) */
  isInitialSetup?: boolean;
  /** 계정 생성 함수 (모달에서 사용 시 전달) */
  onCreateAccount?: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export default function SetupForm({
  isModal = false,
  onSuccess,
  onCancel,
  isInitialSetup = false,
  onCreateAccount
}: SetupFormProps = {}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다');
      return;
    }

    setLoading(true);

    try {
      // 모달에서 사용하는 경우 전달받은 함수 사용, 그렇지 않으면 기본 함수 사용
      const createAccount = onCreateAccount || createAdminAccountSetup;
      const result = await createAccount(
        formData.name,
        formData.email,
        formData.password
      );

      if (!result.success) {
        setError(result.error || '관리자 계정 생성에 실패했습니다');
        setLoading(false);
        return;
      }

      // 성공 시 처리
      toast.success('관리자 계정이 생성되었습니다');

      if (isModal && onSuccess) {
        // 모달에서 사용하는 경우
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setError('');
        onSuccess();
      } else if (isInitialSetup) {
        // 초기 설정 페이지에서 사용하는 경우
        // router.push('/auth/sign-in');
      }
    } catch (err) {
      console.error('관리자 계정 생성 중 오류 발생:', err);
      setError('관리자 계정 생성 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isModal ? "w-full" : "w-full max-w-md relative"}>
      {!isModal && (
        <Link
          href="/"
          className="absolute -top-12 left-0 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>돌아가기</span>
        </Link>
      )}

      {!isModal && (
        <div className="mb-8">
          <h2 className="text-gray-900 text-2xl font-bold mb-2">관리자 계정 설정</h2>
          <p className="text-gray-600">시스템 초기 설정을 위해 관리자 계정을 생성하세요</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">이름</Label>
          <div className="relative mt-1">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="이름"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">이메일</Label>
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@example.com"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">비밀번호</Label>
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="최소 8자 이상"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
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
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="비밀번호 확인"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className={isModal ? "flex gap-2 mt-8" : "mt-8"}>
          {isModal && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-10 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 rounded-md px-4 py-2 flex items-center justify-center transition-colors"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`${isModal ? 'flex-1' : 'w-full'} h-10 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-md px-4 py-2 flex items-center justify-center gap-2 transition-colors`}
          >
            {loading ? '관리자 계정 생성 중...' : '관리자 계정 생성'}
            {!loading && !isModal && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

