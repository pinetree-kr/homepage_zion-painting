'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { toast } from 'sonner';
import { BusinessCategory, Achievement } from '@/src/entities';
import { resizeImage } from '@/src/shared/lib/image-resize';
import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import {
  saveBusinessAchievement,
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
    // 이미지 다운로드
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('이미지 다운로드에 실패했습니다.');
    }

    const blob = await response.blob();
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
        image_url: data.image_url,
      };
    }
    return {
      title: '',
      content: '',
      achievement_date: new Date().toISOString().split('T')[0],
      category_id: null,
    };
  });
  const [saving, setSaving] = useState(false);

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

      // 이미지가 있고, 기존에 image_url이 없거나 변경된 경우 썸네일 생성
      if (extractedImageUrl) {
        // 기존 image_url과 다르거나 없는 경우에만 썸네일 생성
        if (!achievement.image_url || achievement.image_url !== extractedImageUrl) {
          toast.info('썸네일을 생성하는 중...');
          thumbnailUrl = await createAndUploadThumbnail(extractedImageUrl);

          if (!thumbnailUrl) {
            console.warn('썸네일 생성 실패, 원본 이미지 URL 사용');
            thumbnailUrl = extractedImageUrl;
          }
        } else {
          // 기존 썸네일 유지
          thumbnailUrl = achievement.image_url;
        }
      } else {
        // 이미지가 없으면 기존 image_url 유지
        thumbnailUrl = achievement.image_url || null;
      }

      const achievementToSave = {
        ...achievement,
        image_url: thumbnailUrl,
      };

      const result = await saveBusinessAchievement(achievementToSave);
      if (result.success) {
        toast.success('사업실적이 저장되었습니다.');
        router.push('/admin/info/business/achievements');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/info/business/achievements')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
          {/* <h2 className="text-gray-900 text-2xl font-semibold">
            사업실적 {achievementId ? '수정' : '추가'}
          </h2> */}
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
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
              <Label>날짜</Label>
              <Input
                type="date"
                value={achievement.achievement_date}
                onChange={(e) => setAchievement({ ...achievement, achievement_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>적용산업</Label>
            <Select
              value={achievement.category_id || ''}
              onValueChange={(value) => setAchievement({ ...achievement, category_id: value || null })}
            >
              <SelectTrigger>
                <SelectValue placeholder="적용산업 선택" />
              </SelectTrigger>
              <SelectContent className="z-100">
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
              text={achievement.content}
              onChange={(content) => setAchievement({ ...achievement, content })}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

