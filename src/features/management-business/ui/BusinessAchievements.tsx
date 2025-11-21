'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Calendar, Tag } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { toast } from 'sonner';
import { BusinessCategory, Achievement } from '@/src/entities';
import { DataTable, DataTableColumn, DataTableAction } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import {
  getBusinessAchievements,
  deleteBusinessAchievement,
} from '../api/business-actions';

interface BusinessAchievementsProps {
  categories: BusinessCategory[];
  items: Achievement[];
}

export default function BusinessAchievements({
  categories,
  items
}: BusinessAchievementsProps) {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>(items);

  const loadData = async () => {
    try {
      const achievementsData = await getBusinessAchievements();
      setAchievements(achievementsData);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const addAchievement = () => {
    router.push('/admin/info/business/achievements/new');
  };

  const editAchievement = (achievement: Achievement & { category?: BusinessCategory | null }) => {
    router.push(`/admin/info/business/achievements/${achievement.id}`);
  };

  const removeAchievement = async (id: string) => {
    if (!confirm('이 사업실적을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await deleteBusinessAchievement(id);
      if (result.success) {
        toast.success('사업실적이 삭제되었습니다.');
        await loadData();
      } else {
        toast.error(`삭제 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('삭제 오류:', error);
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  // categories를 맵으로 변환하여 빠른 조회 가능하도록
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  const achievementColumns: DataTableColumn<Achievement & { category?: BusinessCategory | null }>[] = [
    {
      id: 'title',
      header: '제목',
      accessor: (row) => row.title,
      sortable: true,
      width: '30%'
    },
    {
      id: 'category',
      header: '카테고리',
      accessor: (row) => (
        <Badge variant="outline" className="text-xs">
          <Tag className="h-3 w-3 mr-1" />
          {row.category?.title || '미분류'}
        </Badge>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'date',
      header: '날짜',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {row.achievement_date}
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'content',
      header: '내용',
      accessor: (row) => {
        // DB에 저장된 content_summary 사용, 없으면 content에서 추출
        let displayText = row.content_summary || row.content;
        // UI에서는 30자로 제한하고 "..." 추가
        if (displayText && displayText.length > 30) {
          displayText = displayText.substring(0, 30) + '...';
        }
        return (
          <div className="text-sm text-gray-600 max-w-md">
            {displayText}
          </div>
        );
      },
      width: '40%'
    }
  ];

  const achievementActions: DataTableAction<Achievement & { category?: BusinessCategory | null }>[] = [
    {
      label: '수정',
      icon: <Edit className="h-4 w-4" />,
      onClick: editAchievement
    },
    {
      label: '삭제',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => removeAchievement(row.id),
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 사업실적 관리 섹션 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">사업실적 목록</h3>
          <Button onClick={addAchievement} className="gap-2">
            <Plus className="h-4 w-4" />
            사업실적 추가
          </Button>
        </div>

        <DataTable
          data={achievements.map(achievement => ({
            ...achievement,
            category: achievement.category_id ? categoryMap.get(achievement.category_id) || null : null,
          }))}
          columns={achievementColumns}
          actions={achievementActions}
          getRowId={(row) => row.id}
          emptyMessage="등록된 사업실적이 없습니다"
        />
      </Card>
    </div>
  );
}

