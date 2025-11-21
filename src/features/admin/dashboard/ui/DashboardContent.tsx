'use client';

import { DashboardStats, RecentPost, EmptyInfo } from '@/src/entities/dashboard';
import StatsCard from './StatsCard';
import RecentPostsList from './RecentPostsList';
import EmptyInfoAlert from './EmptyInfoAlert';
import { Users, UserPlus } from 'lucide-react';

interface DashboardContentProps {
  stats: DashboardStats;
  recentQnA: RecentPost[];
  recentQuotes: RecentPost[];
  emptyInfo: EmptyInfo[];
}

export default function DashboardContent({
  stats,
  recentQnA,
  recentQuotes,
  emptyInfo,
}: DashboardContentProps) {
  return (
    <div className="space-y-6">
      {/* 빈 정보 알림 */}
      {emptyInfo.length > 0 && (
        <EmptyInfoAlert emptyInfo={emptyInfo} />
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="전체 가입자"
          value={stats.totalMembers.toLocaleString()}
          icon={Users}
          description="현재 활성화된 전체 회원 수"
        />
        <StatsCard
          title="최근 일주일 가입자"
          value={stats.recentMembers.toLocaleString()}
          icon={UserPlus}
          description="지난 7일간 신규 가입자 수"
        />
      </div>

      {/* 최근 문의/견적 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPostsList
          title="최근 문의글"
          posts={recentQnA}
          viewAllLink="/admin/customer/qna"
          emptyMessage="최근 문의글이 없습니다."
        />
        <RecentPostsList
          title="최근 견적문의"
          posts={recentQuotes}
          viewAllLink="/admin/customer/estimates"
          emptyMessage="최근 견적문의가 없습니다."
        />
      </div>
    </div>
  );
}

