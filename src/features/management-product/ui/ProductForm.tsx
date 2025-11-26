'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { toast } from 'sonner';
import { ProductCategory, Product } from '@/src/entities';
import { resizeImage } from '@/src/shared/lib/image-resize';
import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import {
  saveProduct,
  deleteProduct,
} from '../api/product-actions';
import { SpecTableEditor, SpecTableData } from './SpecTableEditor';

interface ProductFormProps {
  productId?: string;
  categories?: ProductCategory[];
  data?: Product | null;
}

/**
 * specs JSONB 데이터를 SpecTableData로 변환합니다.
 */
function parseSpecsData(specs: any): SpecTableData | null {
  if (!specs) {
    return null;
  }

  try {
    // 이미 올바른 형식인 경우
    if (specs.headers && Array.isArray(specs.headers) && specs.rows && Array.isArray(specs.rows)) {
      return specs as SpecTableData;
    }

    // 다른 형식의 데이터가 있을 경우 변환 로직 추가 가능
    return null;
  } catch (error) {
    console.error('스펙 데이터 파싱 오류:', error);
    return null;
  }
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
 * HTML content에서 텍스트를 추출하여 요약을 생성합니다.
 */
function extractContentSummary(htmlContent: string, maxLength: number = 50): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    // 이미지 관련 요소 제거
    const images = doc.querySelectorAll('img, figure, figcaption');
    images.forEach(img => img.remove());

    // 텍스트만 추출
    const text = doc.body.textContent || '';

    // HTML 태그 제거 및 공백 정리
    const cleanText = text.replace(/\s+/g, ' ').trim();

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    return cleanText.substring(0, maxLength);
  } catch (error) {
    console.error('내용 요약 추출 오류:', error);
    // 실패 시 이미지 태그를 먼저 제거한 후 HTML 태그 제거
    const withoutImages = htmlContent.replace(/<img[^>]*>/gi, '').replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '');
    const text = withoutImages.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) : text;
  }
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
    const fileName = `products/thumbnails/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

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

export default function ProductForm({
  productId,
  categories = [],
  data = null,
}: ProductFormProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Omit<Product, 'id'> & { id?: string | null }>(() => {
    if (data) {
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        content_summary: data.content_summary || '',
        category_id: data.category_id,
        specs: data.specs,
        status: data.status,
        thumbnail_url: data.thumbnail_url,
      };
    }
    return {
      title: '',
      content: '',
      content_summary: '',
      category_id: null,
      specs: null,
      status: 'draft',
    };
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSave = async () => {
    if (!product.title?.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!product.content?.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);

      // content에서 첫 번째 이미지 URL 추출
      const extractedImageUrl = extractFirstImageUrl(product.content);

      // content에서 요약 추출
      const contentSummary = extractContentSummary(product.content);

      let thumbnailUrl: string | null = null;

      // 이미지가 있고, 기존에 thumbnail_url 없거나 변경된 경우 썸네일 생성
      if (extractedImageUrl) {
        // 기존 thumbnail_url과 다르거나 없는 경우에만 썸네일 생성
        if (!product.thumbnail_url || product.thumbnail_url !== extractedImageUrl) {
          toast.info('썸네일을 생성하는 중...');
          thumbnailUrl = await createAndUploadThumbnail(extractedImageUrl);

          if (!thumbnailUrl) {
            console.warn('썸네일 생성 실패, 원본 이미지 URL 사용');
            thumbnailUrl = extractedImageUrl;
          }
        } else {
          // 기존 썸네일 유지
          thumbnailUrl = product.thumbnail_url;
        }
      } else {
        // 이미지가 없으면 기존 thumbnail_url 유지
        thumbnailUrl = product.thumbnail_url || null;
      }

      const productToSave = {
        ...product,
        thumbnail_url: thumbnailUrl,
        content_summary: contentSummary,
      };

      const result = await saveProduct(productToSave);
      if (result.success) {
        toast.success('제품이 저장되었습니다.');
        // 수정인 경우 refresh, 생성인 경우 목록으로 이동
        if (product.id || productId) {
          router.refresh();
        } else {
          router.push('/admin/info/products');
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
    if (!productId) {
      toast.error('삭제할 제품이 없습니다.');
      return;
    }

    try {
      setDeleting(true);
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success('제품이 삭제되었습니다.');
        router.push('/admin/info/products');
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
            onClick={() => router.push('/admin/info/products')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>제목</Label>
              <Input
                value={product.title}
                onChange={(e) => setProduct({ ...product, title: e.target.value })}
                placeholder="제품명"
              />
            </div>
            <div>
              <Label>상태</Label>
              <Select
                value={product.status}
                onValueChange={(value: 'published' | 'draft') => setProduct({ ...product, status: value })}
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
          </div>
          <div>
            <Label>제품 카테고리</Label>
            <Select
              value={product.category_id || ''}
              onValueChange={(value) => setProduct({ ...product, category_id: value || null })}
              disabled={categories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={categories.length === 0 ? "카테고리 없음" : "제품 카테고리 선택"} />
              </SelectTrigger>
              {categories.length > 0 && (
                <SelectContent className="z-100">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              )}
            </Select>
          </div>
          <div>
            <Label>내용</Label>
            <DynamicCustomEditor
              text={product.content}
              onChange={(content) => setProduct({ ...product, content })}
            />
          </div>
          <div>
            <SpecTableEditor
              value={parseSpecsData(product.specs)}
              onChange={(specsData) => {
                setProduct({
                  ...product,
                  specs: specsData,
                });
              }}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        {productId && (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
            disabled={deleting}
            size="lg"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        )}
        <Button onClick={handleSave} className="gap-2" disabled={saving} size="lg">
          <Save className="h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>제품 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 제품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

