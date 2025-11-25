'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { toast } from 'sonner';
import { Post } from '@/src/entities/post/model/types';
import { savePost } from '../api/post-actions';

interface PostFormProps {
  boardId: string;
  boardCode: 'notices' | 'qna' | 'quotes' | 'reviews';
  boardName: string;
  postId?: string;
  data?: Post | null;
}

/**
 * HTML content에서 첫 번째 이미지 URL을 추출합니다.
 */
function extractFirstImageUrl(htmlContent: string): string | null {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return null;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const firstImg = doc.querySelector('img');

    if (firstImg && firstImg.src) {
      if (!firstImg.src.startsWith('data:')) {
        return firstImg.src;
      }
    }
  } catch (error) {
    console.error('이미지 URL 추출 오류:', error);
  }

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

export default function PostForm({
  boardId,
  boardCode,
  boardName,
  postId,
  data = null,
}: PostFormProps) {
  const router = useRouter();
  const [post, setPost] = useState<Omit<Post, 'id' | 'view_count' | 'like_count' | 'comment_count' | 'created_at' | 'updated_at' | 'deleted_at' | 'board_id'> & { id?: string | null }>(() => {
    if (data) {
      return {
        id: data.id,
        category_id: data.category_id,
        title: data.title,
        content: data.content,
        content_summary: data.content_summary || '',
        author_id: data.author_id,
        author_name: data.author_name,
        author_email: data.author_email,
        author_phone: data.author_phone,
        status: data.status,
        is_pinned: data.is_pinned,
        is_secret: data.is_secret,
        thumbnail_url: data.thumbnail_url,
        extra_json: data.extra_json || null,
      };
    }
    return {
      category_id: null,
      title: '',
      content: '',
      content_summary: '',
      author_id: null,
      author_name: '',
      author_email: '',
      author_phone: '',
      status: 'draft',
      is_pinned: false,
      is_secret: false,
      thumbnail_url: null,
      extra_json: null,
    };
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!post.title?.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!post.content?.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);

      // content에서 첫 번째 이미지 URL 추출
      const extractedImageUrl = extractFirstImageUrl(post.content);

      const postToSave = {
        ...post,
        thumbnail_url: extractedImageUrl || post.thumbnail_url || null,
        board_id: boardId,
        boardCode: boardCode,
      };

      const result = await savePost(postToSave);
      if (result.success) {
        toast.success('게시글이 저장되었습니다.');
        const redirectPath = `/admin/boards/${boardCode}`;
        router.push(redirectPath);
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
        <Button
          variant="ghost"
          onClick={() => {
            const redirectPath = `/admin/boards/${boardCode}`;
            router.push(redirectPath);
          }}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">{boardName} {postId ? '수정' : '작성'}</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <DynamicCustomEditor
              text={post.content}
              onChange={(content) => setPost({ ...post, content })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select
                value={post.status}
                onValueChange={(value: 'draft' | 'published') => setPost({ ...post, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">임시저장</SelectItem>
                  <SelectItem value="published">게시됨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_name">작성자 이름</Label>
              <Input
                id="author_name"
                value={post.author_name || ''}
                onChange={(e) => setPost({ ...post, author_name: e.target.value })}
                placeholder="작성자 이름 (선택사항)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_email">작성자 이메일</Label>
              <Input
                id="author_email"
                type="email"
                value={post.author_email || ''}
                onChange={(e) => setPost({ ...post, author_email: e.target.value })}
                placeholder="작성자 이메일 (선택사항)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_phone">작성자 전화번호</Label>
              <Input
                id="author_phone"
                value={post.author_phone || ''}
                onChange={(e) => setPost({ ...post, author_phone: e.target.value })}
                placeholder="작성자 전화번호 (선택사항)"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_pinned"
                checked={post.is_pinned}
                onCheckedChange={(checked) => setPost({ ...post, is_pinned: checked === true })}
              />
              <Label htmlFor="is_pinned" className="cursor-pointer">
                고정 게시글
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_secret"
                checked={post.is_secret}
                onCheckedChange={(checked) => setPost({ ...post, is_secret: checked === true })}
              />
              <Label htmlFor="is_secret" className="cursor-pointer">
                비밀 게시글
              </Label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

