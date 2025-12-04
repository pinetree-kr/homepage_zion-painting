'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { toast } from 'sonner';
import { BusinessCategory, Achievement } from '@/src/entities';
import { resizeImage } from '@/src/shared/lib/image-resize';
import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import {
  saveBusinessAchievement,
  deleteBusinessAchievement,
} from '../api/business-actions';

interface BusinessAchievementFormProps {
  achievementId?: string;
  categories?: BusinessCategory[];
  data?: Achievement | null;
}

/**
 * HTML content에서 첫 번째 이미지 URL을 추출합니다.
 */
function extractFirstImageUrl(htmlContent: string): string | null {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return null;
  }

  try {
    // DOMParser를 사용하여 HTML 파싱
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const firstImg = doc.querySelector('img');

    if (firstImg && firstImg.src) {
      // data URL이 아닌 실제 URL만 반환
      if (!firstImg.src.startsWith('data:')) {
        return firstImg.src;
      }
    }
  } catch (error) {
    console.error('이미지 URL 추출 오류:', error);
  }

  // DOMParser 실패 시 정규식으로 대체 시도
  try {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const match = htmlContent.match(imgRegex);
    if (match && match[1] && !match[1].startsWith('data:')) {
      return match[1];
    }
  } catch (error) {
    console.error('정규식 이미지 URL 추출 오류:', error);
  }

  return null;
}

/**
 * 이미지 URL에서 이미지를 다운로드하고 썸네일을 생성하여 Supabase Storage에 업로드합니다.
 */
async function createAndUploadThumbnail(imageUrl: string): Promise<string | null> {
  try {
    // 현재 도메인과 다른 도메인의 이미지인지 확인
    let imageResponse: Response;
    try {
      const url = new URL(imageUrl);
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const isExternalImage = url.origin !== currentOrigin &&
        !url.hostname.includes('supabase.co') &&
        !url.hostname.includes('localhost') &&
        !url.hostname.includes('127.0.0.1');

      if (isExternalImage) {
        // 외부 이미지는 API 라우트를 통해 프록시하여 가져오기 (CORS 문제 해결)
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        imageResponse = await fetch(proxyUrl);
      } else {
        // 내부 이미지는 직접 가져오기
        imageResponse = await fetch(imageUrl);
      }
    } catch (urlError) {
      // URL 파싱 실패 시 직접 fetch 시도
      imageResponse = await fetch(imageUrl);
    }

    if (!imageResponse.ok) {
      throw new Error('이미지 다운로드에 실패했습니다.');
    }

    const blob = await imageResponse.blob();
    const file = new File([blob], 'thumbnail.jpg', { type: blob.type || 'image/jpeg' });

    // 이미지 리사이징 (너비 300px 최대)
    let resizedFile: File;
    try {
      resizedFile = await resizeImage(file, {
        maxWidth: 300,
        maxHeight: 300,
        maxSizeMB: 0.5,
        quality: 0.85,
        fileType: 'image/jpeg',
      });
    } catch (resizeError) {
      console.warn('이미지 리사이징 실패, 원본 파일로 업로드:', resizeError);
      resizedFile = file;
    }

    // Supabase Storage에 업로드
    const supabase = createBrowserClient();
    const fileExt = resizedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `achievements/thumbnails/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('editor-images')
      .upload(fileName, resizedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('썸네일 업로드 오류:', uploadError);
      return null;
    }

    // 공개 URL 가져오기
    const { data } = supabase.storage
      .from('editor-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('썸네일 생성 및 업로드 오류:', error);
    return null;
  }
}

export default function BusinessAchievementForm({
  achievementId,
  categories = [],
  data = null,
}: BusinessAchievementFormProps) {
  const router = useRouter();
  const [achievement, setAchievement] = useState<Omit<Achievement, 'id'> & { id?: string | null }>(() => {
    if (data) {
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        achievement_date: data.achievement_date,
        category_id: data.category_id,
        thumbnail_url: data.thumbnail_url,
        status: data.status,
      };
    }
    return {
      title: '',
      content: '',
      achievement_date: new Date().toISOString().split('T')[0],
      category_id: null,
      status: 'draft',
    };
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // SSR로 데이터를 받았으므로 loading 상태 제거
  // useEffect로 추가 데이터 로드가 필요한 경우에만 사용

  const handleSave = async () => {
    if (!achievement.title?.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!achievement.content?.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);

      // content에서 첫 번째 이미지 URL 추출
      const extractedImageUrl = extractFirstImageUrl(achievement.content);

      let thumbnailUrl: string | null = null;

      // 이미지가 있고, 기존에 thumbnail_url 없거나 변경된 경우 썸네일 생성
      if (extractedImageUrl) {
        // 기존 thumbnail_url과 다르거나 없는 경우에만 썸네일 생성
        if (!achievement.thumbnail_url || achievement.thumbnail_url !== extractedImageUrl) {
          toast.info('썸네일을 생성하는 중...');
          thumbnailUrl = await createAndUploadThumbnail(extractedImageUrl);

          if (!thumbnailUrl) {
            console.warn('썸네일 생성 실패, 원본 이미지 URL 사용');
            thumbnailUrl = extractedImageUrl;
          }
        } else {
          // 기존 썸네일 유지
          thumbnailUrl = achievement.thumbnail_url;
        }
      } else {
        // 이미지가 없으면 기존 thumbnail_url 유지
        thumbnailUrl = achievement.thumbnail_url || null;
      }

      const achievementToSave = {
        ...achievement,
        thumbnail_url: thumbnailUrl,
      };

      const result = await saveBusinessAchievement(achievementToSave);
      if (result.success) {
        toast.success('사업실적이 저장되었습니다.');
        // 수정인 경우 refresh, 생성인 경우 목록으로 이동
        if (achievement.id || achievementId) {
          router.refresh();
        } else {
          router.push('/admin/sections/business/achievements');
        }
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

  const handleDelete = async () => {
    if (!achievementId) {
      toast.error('삭제할 사업실적이 없습니다.');
      return;
    }

    try {
      setDeleting(true);
      const result = await deleteBusinessAchievement(achievementId);
      if (result.success) {
        toast.success('사업실적이 삭제되었습니다.');
        router.push('/admin/sections/business/achievements');
      } else {
        toast.error(`삭제 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('삭제 오류:', error);
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/sections/business/achievements')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
          {/* <h2 className="text-gray-900 text-2xl font-semibold">
            사업실적 {achievementId ? '수정' : '추가'}
          </h2> */}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <h3 className="text-gray-900 text-lg font-semibold">사업실적 {achievementId ? '수정' : '추가'}</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>제목</Label>
              <Input
                value={achievement.title}
                onChange={(e) => setAchievement({ ...achievement, title: e.target.value })}
                placeholder="프로젝트 제목"
              />
            </div>
            <div>
              <Label>상태</Label>
              <Select
                value={achievement.status}
                onValueChange={(value: "draft" | "published") => setAchievement({ ...achievement, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">임시저장</SelectItem>
                  <SelectItem value="published">게시됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>날짜</Label>
              <Input
                type="date"
                value={achievement.achievement_date}
                onChange={(e) => setAchievement({ ...achievement, achievement_date: e.target.value })}
              />
            </div>
            <div>
              <Label>적용산업</Label>
              <Select
                value={achievement.category_id || ''}
                onValueChange={(value) => setAchievement({ ...achievement, category_id: value || null })}
                disabled={categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categories.length === 0 ? "분야 없음" : "적용산업 선택"} />
                </SelectTrigger>
                {categories.length > 0 && (
                  <SelectContent className="z-100">
                    {/* <SelectItem value="null">
                      미지정
                    </SelectItem> */}
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                )}
              </Select>
            </div>
          </div>
          <div>
            <Label>내용</Label>
            <DynamicCustomEditor
              text={achievement.content}
              onChange={(content) => setAchievement({ ...achievement, content })}
            />
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          {achievementId && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="h-[42px] gap-2"
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? '삭제 중...' : '삭제'}
            </Button>
          )}
          <Button onClick={handleSave} className="h-[42px] gap-2" disabled={saving} size="lg">
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사업실적 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 사업실적을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

