'use client';

import { useState, useEffect } from 'react';
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
import { supabaseClient } from '@/src/shared/lib/supabase/client';
import type { Profile } from '@/src/entities/user/model/types';

interface PostFormProps {
  boardId: string;
  boardCode: 'notices' | 'qna' | 'quotes' | 'reviews';
  boardName: string;
  allowGuest: boolean;
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
  allowGuest,
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
  const [loading, setLoading] = useState(true);

  // allow_guest가 false일 때 로그인 확인 및 사용자 정보 자동 채우기
  useEffect(() => {
    const loadUserInfo = async () => {
      if (allowGuest) {
        // allow_guest가 true이면 로그인 확인 불필요
        setLoading(false);
        return;
      }

      // allow_guest가 false이면 로그인 확인 필요
      try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        if (userError || !user) {
          toast.error('로그인이 필요합니다.');
          router.push('/auth/sign-in');
          return;
        }

        // 수정 모드가 아니고 (data가 없을 때) 사용자 정보로 자동 채우기
        if (!data) {
          // 사용자 프로필 정보 가져오기
          const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('id, name, email, phone')
            .eq('id', user.id)
            .single<Profile>();

          if (profileError || !profile) {
            toast.error('사용자 정보를 가져올 수 없습니다.');
            router.push('/auth/sign-in');
            return;
          }

          // 사용자 정보로 자동 채우기
          setPost((prev) => ({
            ...prev,
            author_id: profile.id,
            author_name: profile.name || '',
            author_email: profile.email || '',
            author_phone: profile.phone || '',
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        toast.error('사용자 정보를 불러오는 중 오류가 발생했습니다.');
        router.push('/auth/sign-in');
      }
    };

    loadUserInfo();
  }, [allowGuest, router, data]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#1A2C6D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
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
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">{boardName} {postId ? '수정' : '작성'}</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
            <div className="space-y-2 col-span-3">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="space-y-2 col-span-1">
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
          </div>

          {allowGuest && (
            <>
              <div className="space-y-2">
                <Label htmlFor="author_name">이름</Label>
                <Input
                  id="author_name"
                  value={post.author_name || ''}
                  onChange={(e) => setPost({ ...post, author_name: e.target.value })}
                  placeholder="이름"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_email">이메일</Label>
                <Input
                  id="author_email"
                  type="email"
                  value={post.author_email || ''}
                  onChange={(e) => setPost({ ...post, author_email: e.target.value })}
                  placeholder="이메일"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_phone">전화번호</Label>
                <Input
                  id="author_phone"
                  value={post.author_phone || ''}
                  onChange={(e) => setPost({ ...post, author_phone: e.target.value })}
                  placeholder="전화번호 (선택사항)"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <DynamicCustomEditor
              text={post.content}
              onChange={(content) => setPost({ ...post, content })}
            />
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

      <div className="flex items-center justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}

