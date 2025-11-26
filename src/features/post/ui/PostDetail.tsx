'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Calendar, CircleUser, Eye, Mail, Trash2, Pin, Edit, UserCircle, Search } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card, CardContent } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/src/shared/ui';
import { toast } from 'sonner';
import { Post } from '@/src/entities/post/model/types';
import { deletePost } from '../api/post-actions';
import Comments from '@/src/features/comment/ui/Comments';
import { supabaseClient } from '@/src/shared/lib/supabase/client';
import type { Profile } from '@/src/entities/user/model/types';

interface PostDetailProps {
  post: Post;
  boardCode: 'notices' | 'qna' | 'quotes' | 'reviews';
  boardName: string;
  allowComment: boolean;
}

export default function PostDetail({ post, boardCode, boardName, allowComment }: PostDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
          setCurrentUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // 프로필 정보 가져오기
        const { data: profileData } = await supabaseClient
          .from('profiles')
          .select('id, name, email')
          .eq('id', user.id)
          .single<Profile>();

        if (profileData) {
          setCurrentUser(profileData);
        }

        // 관리자 여부 확인
        const { data: adminData } = await supabaseClient
          .from('administrators')
          .select('id')
          .eq('id', user.id)
          .is('deleted_at', null)
          .maybeSingle();

        setIsAdmin(adminData !== null);
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        setCurrentUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 작성자 또는 관리자인지 확인
  const canEdit = currentUser && (currentUser.id === post.author_id || isAdmin);

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

      <Card className="shadow-md">
        <CardContent className="rounded-xl overflow-hidden" style={{ padding: '0px' }}>
          {/* 제목 */}
          <div className="flex items-center justify-between p-2 md:p-4 px-4 md:px-8 bg-slate-200/60 border-b border-gray-200">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {post.is_pinned && <Pin className="h-5 w-5 text-yellow-500" />}
              {post.title}
            </h1>
            <Badge variant='default' className='text-xs'>
              {post.status === 'published' ? '게시됨' : '임시저장'}
            </Badge>
          </div>

          <div className="p-4 md:px-8 space-y-4">

            {/* 사용자 정보와 날짜/조회수 */}
            <div className="flex items-center justify-between text-sm text-gray-600 pb-4">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-gray-900 transition-colors cursor-pointer">
                      <div className="relative h-6 w-6 rounded-full overflow-hidden bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] text-white flex items-center justify-center hover:opacity-80 transition-opacity outline-none">
                        {(() => {
                          // extra_json에서 author_image 확인 (나중에 author_image 필드가 추가될 수 있음)
                          const authorImage = post.extra_json?.author_image || null;
                          
                          if (authorImage) {
                            return (
                              <Image
                                src={authorImage}
                                alt={post.author_name || '사용자'}
                                fill
                                className="object-cover"
                              />
                            );
                          } else if (post.author_name) {
                            return (
                              <span className="text-[10px] font-medium">{post.author_name.charAt(0)}</span>
                            );
                          } else {
                            return <CircleUser className="h-3 w-3" />;
                          }
                        })()}
                      </div>
                      <span className="font-medium">{post.author_name || '-'}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push('/mypage/profile')}
                      className="cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      프로필
                    </DropdownMenuItem>
                    {post.author_email && (
                      <DropdownMenuItem
                        onClick={() => window.location.href = `mailto:${post.author_email}`}
                        className="cursor-pointer"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        메일보내기
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (post.author_name) {
                          router.push(`/admin/boards/${boardCode}?search=${encodeURIComponent(post.author_name)}`);
                        }
                      }}
                      className="cursor-pointer"
                      disabled={!post.author_name}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      작성글검색
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(post.updated_at || post.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span>{post.view_count}</span>
                </div>
              </div>
            </div>

            {/* 본문 내용 */}
            <div className="pt-4">
              <div
                className="prose max-w-none text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </Button>
          <Button
            variant="default"
            onClick={() => router.push(`/admin/boards/${boardCode}/${post.id}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            수정
          </Button>
        </div>
      )}

      {/* 댓글 섹션 */}
      {allowComment && <Comments postId={post.id} />}

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

