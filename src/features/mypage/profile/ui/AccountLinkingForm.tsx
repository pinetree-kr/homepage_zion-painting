'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/src/shared/ui';
import { getLinkedAccounts, signInWithGoogle, signInWithKakao } from '@/src/features/auth/api/auth-actions';
import { Mail, Link2, Check } from 'lucide-react';

interface AccountLinkingFormProps {
  userId: string;
  currentEmail: string | null;
  onAccountLinked?: () => void;
}

export default function AccountLinkingForm({ userId, currentEmail, onAccountLinked }: AccountLinkingFormProps) {
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);

  useEffect(() => {
    loadLinkedAccounts();
  }, [userId]);

  const loadLinkedAccounts = async () => {
    try {
      setLoading(true);
      const result = await getLinkedAccounts(userId);
      if (result.success && result.providers) {
        setLinkedProviders(result.providers);
      }
    } catch (error) {
      console.error('연결된 계정 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (provider: 'google' | 'kakao' | 'naver') => {
    try {
      setLinking(provider);
      const host = window.location.host;
      const protocol = window.location.protocol.replace(':', '');
      // 현재 사용자 ID를 콜백 URL에 포함하여 계정 연동 시 사용
      const redirectUri = `${protocol}://${host}/auth/callback/${provider}`;

      if (provider === 'google') {
        const { url } = await signInWithGoogle({ redirectUri, linkUserId: userId });
        window.location.href = url;
      } else if (provider === 'kakao') {
        const { url } = await signInWithKakao({ redirectUri, linkUserId: userId });
        window.location.href = url;
      } else if (provider === 'naver') {
        // 네이버는 아직 구현되지 않음
        // alert('네이버 연동은 준비 중입니다.');
        console.log('네이버 연동은 준비 중입니다.');
        setLinking(null);
      }
    } catch (error) {
      console.error('계정 연동 실패:', error);
      // alert('계정 연동에 실패했습니다.');
      console.log('계정 연동에 실패했습니다.');
      setLinking(null);
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'email':
        return {
          name: '이메일',
          icon: <Mail className="w-5 h-5" />,
          color: 'text-gray-600',
        };
      case 'google':
        return {
          name: '구글',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          ),
          color: 'text-blue-600',
        };
      case 'kakao':
        return {
          name: '카카오',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path fill="#3C1E1E" d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.8 5.1 4.5 6.3l-1.2 4.5c-.1.3.2.5.4.3l5.1-2.7c.6.1 1.2.1 1.8.1 5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
            </svg>
          ),
          color: 'text-yellow-600',
        };
      case 'naver':
        return {
          name: '네이버',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path fill="#03C75A" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
            </svg>
          ),
          color: 'text-green-600',
        };
      default:
        return {
          name: provider,
          icon: <Link2 className="w-5 h-5" />,
          color: 'text-gray-600',
        };
    }
  };

  const allProviders = ['email', 'google', 'kakao', 'naver'];
  const availableProviders = allProviders.filter(p => p !== 'email' || currentEmail);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-normal text-[#101828]">연결된 계정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">로딩 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-normal text-[#101828]">연결된 계정</CardTitle>
        <p className="text-sm text-[#4D4D4D] mt-1">
          여러 로그인 방법을 연결하여 더 편리하게 로그인하세요
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availableProviders.map((provider) => {
            const isLinked = linkedProviders.includes(provider);
            const providerInfo = getProviderInfo(provider);
            const isLinkingThis = linking === provider;

            return (
              <div
                key={provider}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={providerInfo.color}>{providerInfo.icon}</div>
                  <div>
                    <div className="font-medium text-[#101828]">{providerInfo.name}</div>
                    {provider === 'email' && currentEmail && (
                      <div className="text-sm text-[#4D4D4D]">{currentEmail}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isLinked ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">연결됨</span>
                    </div>
                  ) : provider !== 'email' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkAccount(provider as 'google' | 'kakao' | 'naver')}
                      disabled={isLinkingThis || linking !== null}
                    >
                      {isLinkingThis ? '연결 중...' : '연결하기'}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

