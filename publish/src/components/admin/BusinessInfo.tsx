import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical, Edit, Calendar, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { EditorComponent } from './EditorComponent';
import { toast } from 'sonner';
import { BusinessArea, Achievement } from '../../types';
import { Textarea } from '../ui/textarea';
import { DataTable, DataTableColumn, DataTableAction } from '../ui/data-table';
import { Badge } from '../ui/badge';

export function BusinessInfo() {
  const [businessAreas, setBusinessAreas] = useState<BusinessArea[]>([
    {
      id: '1',
      title: '도장설비',
      description: '최첨단 도장설비 제공',
      features: ['자동화 시스템', '품질 관리'],
      order: 1,
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: '프로젝트 완료',
      content: '대형 프로젝트 성공적 완료',
      date: '2024-01-15',
      category: '실적',
    },
  ]);

  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const addBusinessArea = () => {
    const newArea: BusinessArea = {
      id: Date.now().toString(),
      title: '',
      description: '',
      features: [],
      order: businessAreas.length + 1,
    };
    setBusinessAreas([...businessAreas, newArea]);
  };

  const removeBusinessArea = (id: string) => {
    setBusinessAreas(businessAreas.filter(area => area.id !== id));
  };

  const updateBusinessArea = (id: string, field: keyof BusinessArea, value: any) => {
    setBusinessAreas(businessAreas.map(area =>
      area.id === id ? { ...area, [field]: value } : area
    ));
  };

  const addFeature = (areaId: string) => {
    setBusinessAreas(businessAreas.map(area =>
      area.id === areaId ? { ...area, features: [...area.features, ''] } : area
    ));
  };

  const updateFeature = (areaId: string, index: number, value: string) => {
    setBusinessAreas(businessAreas.map(area =>
      area.id === areaId
        ? { ...area, features: area.features.map((f, i) => i === index ? value : f) }
        : area
    ));
  };

  const removeFeature = (areaId: string, index: number) => {
    setBusinessAreas(businessAreas.map(area =>
      area.id === areaId
        ? { ...area, features: area.features.filter((_, i) => i !== index) }
        : area
    ));
  };

  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      category: '실적',
    };
    setSelectedAchievement(newAchievement);
    setIsEditDialogOpen(true);
  };

  const editAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsEditDialogOpen(true);
  };

  const saveAchievement = () => {
    if (selectedAchievement) {
      const exists = achievements.find(a => a.id === selectedAchievement.id);
      if (exists) {
        setAchievements(achievements.map(a =>
          a.id === selectedAchievement.id ? selectedAchievement : a
        ));
      } else {
        setAchievements([...achievements, selectedAchievement]);
      }
      setIsEditDialogOpen(false);
      setSelectedAchievement(null);
      toast.success('사업실적이 저장되었습니다.');
    }
  };

  const removeAchievement = (id: string) => {
    setAchievements(achievements.filter(a => a.id !== id));
    toast.success('사업실적이 삭제되었습니다.');
  };

  const handleSave = () => {
    toast.success('사업 정보가 저장되었습니다.');
  };

  const achievementColumns: DataTableColumn<Achievement>[] = [
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
          {row.category || '실적'}
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
          {row.date}
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

  const achievementActions: DataTableAction<Achievement>[] = [
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">사업소개 관리</h2>
          <p className="text-muted-foreground text-sm">사업분야와 사업실적을 관리합니다</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          저장
        </Button>
      </div>

      <Tabs defaultValue="areas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="areas">사업분야</TabsTrigger>
          <TabsTrigger value="achievements">사업실적</TabsTrigger>
        </TabsList>

        <TabsContent value="areas" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">사업분야 관리</h3>
              <Button onClick={addBusinessArea} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                사업분야 추가
              </Button>
            </div>

            <div className="space-y-4">
              {businessAreas.map((area) => (
                <div key={area.id} className="p-4 border border-border rounded-lg bg-white space-y-4">
                  <div className="flex gap-4 items-start">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move mt-2" />
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>사업분야명</Label>
                          <Input
                            value={area.title}
                            onChange={(e) => updateBusinessArea(area.id, 'title', e.target.value)}
                            placeholder="도장설비"
                          />
                        </div>
                        <div>
                          <Label>설명</Label>
                          <Input
                            value={area.description}
                            onChange={(e) => updateBusinessArea(area.id, 'description', e.target.value)}
                            placeholder="최첨단 도장설비 제공"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>주요 특징</Label>
                          <Button
                            onClick={() => addFeature(area.id)}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <Plus className="h-3 w-3" />
                            특징 추가
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {area.features.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={feature}
                                onChange={(e) => updateFeature(area.id, index, e.target.value)}
                                placeholder="특징 입력"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFeature(area.id, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeBusinessArea(area.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">사업실적 관리</h3>
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
        </TabsContent>
      </Tabs>

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
                    value={selectedAchievement.date}
                    onChange={(e) => setSelectedAchievement({ ...selectedAchievement, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>카테고리</Label>
                <Input
                  value={selectedAchievement.category || ''}
                  onChange={(e) => setSelectedAchievement({ ...selectedAchievement, category: e.target.value })}
                  placeholder="실적"
                />
              </div>
              <div>
                <Label>내용</Label>
                <EditorComponent
                  initialValue={selectedAchievement.content}
                  onChange={(content) => setSelectedAchievement({ ...selectedAchievement, content })}
                  height="400px"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
