"use server"

import { DashboardContent } from '@/src/features/admin/dashboard';
import {
  getDashboardStats,
  getRecentQnA,
  getRecentQuotes,
  getEmptyInfo,
} from '@/src/entities/dashboard';

export default async function ManagementDashboardPage() {
  const [stats, recentQnA, recentQuotes, emptyInfo] = await Promise.all([
    getDashboardStats(),
    getRecentQnA(5),
    getRecentQuotes(5),
    getEmptyInfo(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-2">시스템 현황을 한눈에 확인하세요</p>
      </div>
      <DashboardContent
        stats={stats}
        recentQnA={recentQnA}
        recentQuotes={recentQuotes}
        emptyInfo={emptyInfo}
      />
    </div>
  );
}

