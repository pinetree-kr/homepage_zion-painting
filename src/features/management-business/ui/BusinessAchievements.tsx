'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Calendar, Tag } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { toast } from 'sonner';
import { BusinessCategory, Achievement } from '@/src/entities';
import { DataTable, DataTableColumn, DataTableAction } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import {
  getBusinessCategories,
  saveBusinessCategory,
  deleteBusinessCategory,
  getBusinessAchievements,
  saveBusinessAchievement,
  deleteBusinessAchievement,
} from '../api/business-actions';

function generateId() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  if (typeof window !== 'undefined') {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return '';
}

export default function BusinessAchievements() {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [achievements, setAchievements] = useState<(Achievement & { category?: BusinessCategory | null })[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<(Achievement & { category?: BusinessCategory | null }) | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, achievementsData] = await Promise.all([
        getBusinessCategories(),
        getBusinessAchievements(),
      ]);

      setCategories(categoriesData);
      setAchievements(achievementsData);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!selectedCategory || !selectedCategory.title?.trim()) {
      toast.error('카테고리명을 입력해주세요.');
      return;
    }

    try {
      const result = await saveBusinessCategory(selectedCategory);
      if (result.success) {
        toast.success('카테고리가 저장되었습니다.');
        setIsCategoryDialogOpen(false);
        setSelectedCategory(null);
        await loadData();
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('이 카테고리를 삭제하시겠습니까? 관련된 사업실적의 카테고리가 해제됩니다.')) {
      return;
    }

    try {
      const result = await deleteBusinessCategory(id);
      if (result.success) {
        toast.success('카테고리가 삭제되었습니다.');
        await loadData();
      } else {
        toast.error(`삭제 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('삭제 오류:', error);
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const addAchievement = () => {
    const newAchievement: Achievement & { category?: BusinessCategory | null } = {
      id: generateId(),
      title: '',
      content: '',
      achievement_date: new Date().toISOString().split('T')[0],
      category_id: null,
    };
    setSelectedAchievement(newAchievement);
    setIsEditDialogOpen(true);
  };

  const editAchievement = (achievement: Achievement & { category?: BusinessCategory | null }) => {
    setSelectedAchievement(achievement);
    setIsEditDialogOpen(true);
  };

  const saveAchievement = async () => {
    if (!selectedAchievement) return;

    if (!selectedAchievement.title?.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!selectedAchievement.content?.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    try {
      const result = await saveBusinessAchievement(selectedAchievement);
      if (result.success) {
        toast.success('사업실적이 저장되었습니다.');
        setIsEditDialogOpen(false);
        setSelectedAchievement(null);
        await loadData();
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
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
      accessor: (row) => (
        <div className="text-sm text-gray-600 line-clamp-2 max-w-md">
          {row.content}
        </div>
      ),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 적용산업 관리 섹션 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">적용산업 목록</h3>
          <Button onClick={() => { setSelectedCategory({ id: '', title: '' }); setIsCategoryDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            적용산업 추가
          </Button>
        </div>

        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-gray-900">{category.title}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedCategory(category); setIsCategoryDialogOpen(true); }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-500 text-center py-8">등록된 적용산업이 없습니다.</p>
          )}
        </div>
      </Card>

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
          data={achievements}
          columns={achievementColumns}
          actions={achievementActions}
          getRowId={(row) => row.id}
          emptyMessage="등록된 사업실적이 없습니다"
        />
      </Card>

      {/* 카테고리 편집 다이얼로그 */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>적용산업 {selectedCategory?.id ? '수정' : '추가'}</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label>카테고리명</Label>
                <Input
                  value={selectedCategory.title}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, title: e.target.value })}
                  placeholder="예: 자동차, 전자, 건설기계"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsCategoryDialogOpen(false); setSelectedCategory(null); }}>
                  취소
                </Button>
                <Button onClick={handleSaveCategory}>
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 사업실적 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>사업실적 {selectedAchievement?.id ? '수정' : '추가'}</DialogTitle>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>제목</Label>
                  <Input
                    value={selectedAchievement.title}
                    onChange={(e) => setSelectedAchievement({ ...selectedAchievement, title: e.target.value })}
                    placeholder="프로젝트 제목"
                  />
                </div>
                <div>
                  <Label>날짜</Label>
                  <Input
                    type="date"
                    value={selectedAchievement.achievement_date}
                    onChange={(e) => setSelectedAchievement({ ...selectedAchievement, achievement_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>적용산업</Label>
                <Select
                  value={selectedAchievement.category_id || ''}
                  onValueChange={(value) => setSelectedAchievement({ ...selectedAchievement, category_id: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="적용산업 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">미분류</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>내용</Label>
                <DynamicCustomEditor
                  text={selectedAchievement.content}
                  onChange={(content) => setSelectedAchievement({ ...selectedAchievement, content })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedAchievement(null); }}>
                  취소
                </Button>
                <Button onClick={saveAchievement}>
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

