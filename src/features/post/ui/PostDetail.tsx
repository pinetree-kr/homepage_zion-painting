'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User as UserIcon, Eye, MessageSquare, ThumbsUp, Mail, Phone, Trash2, Pin } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import { toast } from 'sonner';
import { Post } from '@/src/entities/post/model/types';
import { deletePost } from '../api/post-actions';

interface PostDetailProps {
  post: Post;
  boardCode: 'notices' | 'qna' | 'quotes' | 'reviews';
  boardName: string;
}

export default function PostDetail({ post, boardCode, boardName }: PostDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deletePost(post.id, boardCode);
      if (result.success) {
        toast.success('게시글이 삭제되었습니다.');
        // quote는 estimates 경로로 리다이렉트
        const redirectPath = `/admin/boards/${boardCode}`;
        router.push(redirectPath);
      } else {
        toast.error(`삭제 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
        setDeleting(false);
        setShowDeleteDialog(false);
      }
    } catch (error: any) {
      console.error('삭제 오류:', error);
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {post.is_pinned && <Pin className="h-5 w-5 text-yellow-500" />}
              {post.title}
            </CardTitle>
            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
              {post.status === 'published' ? '게시됨' : '임시저장'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">작성자</label>
              <div className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span>{post.author_name || '-'}</span>
              </div>
            </div>

            {post.author_email && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">이메일</label>
                <div className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{post.author_email}</span>
                </div>
              </div>
            )}

            {post.author_phone && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">전화번호</label>
                <div className="flex items-center gap-2 text-base">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{post.author_phone}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">작성일</label>
              <div className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">조회수</label>
              <div className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4 text-gray-400" />
                <span>{post.view_count}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">좋아요</label>
              <div className="flex items-center gap-2 text-base">
                <ThumbsUp className="h-4 w-4 text-gray-400" />
                <span>{post.like_count}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">댓글</label>
              <div className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span>{post.comment_count}</span>
              </div>
            </div>

            {post.updated_at && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">수정일</label>
                <div className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(post.updated_at)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium text-gray-500 mb-2 block">내용</label>
            <div
              className="prose max-w-none text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

