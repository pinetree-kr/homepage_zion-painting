'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // 대시보드로 리다이렉트
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-16 h-16 border-4 border-[#1A2C6D] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

