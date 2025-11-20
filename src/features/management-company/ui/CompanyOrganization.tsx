'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical, Upload, User, X } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { saveCompanyOrganizationMembers } from '../api/company-actions';
import { toast } from 'sonner';
import type { OrganizationMember } from '@/src/entities/company/model/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import { resizeImage } from '@/src/shared/lib/image-resize';

interface CompanyOrganizationProps {
  items: OrganizationMember[];
}

// SortableItem 컴포넌트
function SortableMemberItem({
  member,
  onUpdate,
  onRemove,
  onImageUpload,
}: {
  member: OrganizationMember;
  onUpdate: (id: string, field: keyof OrganizationMember, value: string | null) => void;
  onRemove: (id: string) => void;
  onImageUpload: (id: string, file: File) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 이미지 URL이 변경되면 에러 상태 초기화
  useEffect(() => {
    setImageError(false);
  }, [member.image_url]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이미지 클릭 이벤트 전파 방지
    onUpdate(member.id, 'image_url', null);
    setImageError(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploading(true);
    setImageError(false); // 새 이미지 업로드 시 에러 상태 초기화
    try {
      await onImageUpload(member.id, file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-4 p-4 border rounded-lg bg-white ${isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'
        }`}
    >
      <div className="flex items-start justify-between">
        <div
          {...attributes}
          {...listeners}
          className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors mt-1"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onRemove(member.id)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* 프로필 이미지 */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div
            onClick={handleImageClick}
            className={`relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors ${uploading ? 'opacity-50' : ''
              }`}
          >
            {member.image_url && !imageError ? (
              <img
                src={member.image_url}
                alt={member.name || '프로필 이미지'}
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-sm">업로드 중...</div>
              </div>
            )}
          </div>
          {/* 이미지 삭제 버튼 - 이미지 영역 밖에 배치 */}
          {member.image_url && !imageError && !uploading && (
            <button
              onClick={handleImageDelete}
              className="absolute -top-1 -right-1 w-6 h-6 bg-gray-400 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors shadow-md z-10"
              title="이미지 삭제"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleImageClick}
          disabled={uploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {member.image_url ? '이미지 변경' : '이미지 업로드'}
        </Button>
      </div>

      {/* 이름 */}
      <div>
        <Label>이름</Label>
        <Input
          value={member.name}
          onChange={(e) => onUpdate(member.id, 'name', e.target.value)}
          placeholder="홍길동"
        />
      </div>

      {/* 직책 */}
      <div>
        <Label>직책</Label>
        <Input
          value={member.title}
          onChange={(e) => onUpdate(member.id, 'title', e.target.value)}
          placeholder="대표이사"
        />
      </div>
    </div>
  );
}

export default function CompanyOrganization({ items }: CompanyOrganizationProps) {
  const [members, setMembers] = useState<OrganizationMember[]>(items || []);
  const [saving, setSaving] = useState(false);
  const supabaseClient = createBrowserClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addMember = () => {
    const newMember: OrganizationMember = {
      id: `temp-${Date.now()}`,
      name: '',
      title: '',
      image_url: null,
      display_order: members.length > 0 ? Math.max(...members.map(m => m.display_order)) + 1 : 1,
      created_at: null,
      updated_at: null,
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(item => item.id !== id));
  };

  const updateMember = (id: string, field: keyof OrganizationMember, value: string | null) => {
    setMembers(members.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleImageUpload = async (id: string, file: File) => {
    try {
      // 이미지 리사이징
      let fileToUpload = file;
      try {
        fileToUpload = await resizeImage(file, {
          maxWidth: 400,
          maxHeight: 400,
          maxSizeMB: 0.5,
          quality: 0.9,
          fileType: 'image/jpeg',
        });
      } catch (resizeError) {
        console.warn('이미지 리사이징 실패, 원본 파일로 업로드:', resizeError);
        fileToUpload = file;
      }

      // 파일명 생성
      const fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `organization/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabaseClient.storage
        .from('editor-images')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('이미지 업로드 오류:', uploadError);
        toast.error('이미지 업로드에 실패했습니다.');
        return;
      }

      // 공개 URL 가져오기
      const { data } = supabaseClient.storage
        .from('editor-images')
        .getPublicUrl(fileName);

      // 멤버 정보 업데이트
      updateMember(id, 'image_url', data.publicUrl);
      toast.success('이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // display_order 업데이트
        return newItems.map((item, index) => ({
          ...item,
          display_order: index + 1,
        }));
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await saveCompanyOrganizationMembers(members);

      if (result.success) {
        toast.success('조직도가 저장되었습니다.');
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900 text-lg font-semibold">조직도</h3>
        <Button onClick={handleSave} className="gap-2" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={members.map(m => m.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 310px))' }}>
            {members.map((member) => (
              <SortableMemberItem
                key={member.id}
                member={member}
                onUpdate={updateMember}
                onRemove={removeMember}
                onImageUpload={handleImageUpload}
              />
            ))}
            {/* 구성원 추가 카드 */}
            <button
              onClick={addMember}
              className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 hover:bg-gray-50 transition-colors cursor-pointer min-h-[400px]"
            >
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <span className="text-gray-600 font-medium">구성원 추가</span>
            </button>
          </div>
        </SortableContext>
      </DndContext>
    </Card>
  );
}
