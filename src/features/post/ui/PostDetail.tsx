'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Calendar, CircleUser, Eye, Mail, Trash2, Pin, Edit, UserCircle, Search, Download, File, Image as ImageIcon, FileText } from 'lucide-react';
import { Button, CardFooter } from '@/src/shared/ui';
import { Card, CardContent } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/src/shared/ui';
import { toast } from 'sonner';
import { Post, PostFile } from '@/src/entities/post/model/types';
import { deletePost } from '../api/post-actions';
import Comments, { type CommentWithProfile } from '@/src/features/comment/ui/Comments';
import { BoardPolicy } from '@/src/entities/board/model/types';
import { generateUserColor, rgbToCss, formatDateKorean } from '@/src/shared/lib/utils';

interface PostDetailProps {
  post: Post;
  boardId: string;
  boardCode: string;
  boardName: string;
  attachedFiles?: PostFile[];
  isPublic?: boolean; // 일반 사용자용인지 여부
  isAdmin?: boolean; // 관리자 여부
  isAuthor?: boolean; // 작성자 여부
  permissions?: Omit<BoardPolicy, 'board_id' | 'role' | 'post_list' | 'post_create' | 'file_upload' | 'created_at' | 'updated_at'>; // 권한 정보
  comments?: CommentWithProfile[]; // 서버에서 가져온 초기 댓글 데이터
}

export default function PostDetail({
  post,
  boardId,
  boardName,
  attachedFiles = [],
  isPublic = false,
  isAdmin = false,
  isAuthor = false,
  permissions = {
    post_read: false,
    post_edit: false,
    post_delete: false,
    cmt_create: false,
    cmt_read: false,
    cmt_edit: false,
    cmt_delete: false,
    file_download: false,
  },
  comments = []
}: PostDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // board_policies에서 댓글 권한 확인 (어떤 역할이든 하나라도 cmt_create 또는 cmt_read 권한이 있으면 허용)
  // permissions가 있으면 그것을 우선 사용
  const allowComment = useMemo(() => {
    return permissions?.cmt_create || permissions?.cmt_read;
  }, [permissions?.cmt_create, permissions?.cmt_read]);

  const canEdit = useMemo(() => {
    return permissions?.post_edit && (isAuthor || isAdmin);
  }, [permissions?.post_edit, isAuthor, isAdmin]);

  const canDelete = useMemo(() => {
    return permissions?.post_delete && (isAuthor || isAdmin);
  }, [permissions?.post_delete, isAuthor, isAdmin]);

  const canDownloadFile = useMemo(() => {
    return permissions?.file_download;
  }, [permissions?.file_download]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      console.log('handleDelete', post.id, boardId);
      const result = await deletePost(post.id, boardId);
      if (result.success) {
        toast.success('게시글이 삭제되었습니다.');
        // 일반 사용자용인지 확인하여 리다이렉트 경로 결정
        const redirectPath = isPublic ? `/boards/${boardId}` : `/admin/boards/${boardId}`;
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
  }, [post.id, boardId, isPublic, router]);

  const formatDate = useCallback((dateString: string | null | undefined) => {
    return formatDateKorean(dateString, true);
  }, []);

  /**
   * 파일 크기를 읽기 쉬운 형식으로 변환
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  /**
   * 파일 타입에 따른 아이콘 반환
   */
  const getFileIcon = useCallback((mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return ImageIcon;
    }
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return FileText;
    }
    return File;
  }, []);

  /**
   * 파일 다운로드 핸들러
   */
  const handleDownload = useCallback(async (file: PostFile) => {
    try {
      // 파일을 fetch로 가져와서 Blob으로 변환
      const response = await fetch(file.file_url);
      if (!response.ok) {
        throw new Error('파일 다운로드에 실패했습니다.');
      }

      const blob = await response.blob();

      // Blob URL 생성
      const blobUrl = window.URL.createObjectURL(blob);

      // 다운로드 링크 생성
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.file_name; // 원본 파일명으로 다운로드
      document.body.appendChild(link);
      link.click();

      // 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      toast.error('파일 다운로드에 실패했습니다.');
    }
  }, []);

  return (
    <>
      <Card>
        <CardContent style={{ padding: '0px' }}>
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
                      {(() => {
                        // extra_json에서 author_image 확인 (나중에 author_image 필드가 추가될 수 있음)
                        const authorImage = post.extra_json?.author_image || null;
                        const authorName = post.author_metadata?.name || '익명';
                        // 사용자 ID를 기준으로 색상 생성
                        const userColor = generateUserColor(post.author_id);
                        const backgroundColor = rgbToCss(userColor);

                        return (
                          <div
                            className="relative h-6 w-6 rounded-full overflow-hidden text-white flex items-center border border-gray-50/80 justify-center hover:opacity-80 transition-opacity outline-none"
                            style={{ backgroundColor }}
                          >
                            {authorImage ? (
                              <Image
                                src={authorImage}
                                alt={authorName}
                                fill
                                className="object-cover"
                              />
                            ) : authorName ? (
                              <span className="text-[10px] font-medium">{authorName.charAt(0).toUpperCase()}</span>
                            ) : (
                              <CircleUser className="h-3 w-3" />
                            )}
                          </div>
                        );
                      })()}
                      <span className="font-medium">
                        {post.author_metadata?.name || '-'}
                        {!post.author_id && post.author_metadata?.name && <span className="text-gray-500/50 ml-1">(탈퇴한 회원)</span>}
                      </span>
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
                    {post.author_metadata?.email && (
                      <DropdownMenuItem
                        onClick={() => window.location.href = `mailto:${post.author_metadata?.email}`}
                        className="cursor-pointer"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        메일보내기
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (post.author_metadata?.name) {
                          const searchPath = isPublic
                            ? `/boards/${boardId}&search=${encodeURIComponent(post.author_metadata?.name)}`
                            : `/admin/boards/${boardId}?search=${encodeURIComponent(post.author_metadata?.name)}`;
                          router.push(searchPath);
                        }
                      }}
                      className="cursor-pointer"
                      disabled={!post.author_metadata?.name}
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
                className="prose max-w-none text-sm text-gray-700 ck-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* 첨부 파일 목록 */}
            {attachedFiles.length > 0 && (
              <div className="pt-6 mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">첨부 파일 ({attachedFiles.length})</h3>
                <div className="space-y-2">
                  {attachedFiles.map((file) => {
                    const FileIconComponent = getFileIcon(file.mime_type);
                    const isImage = file.mime_type.startsWith('image/');

                    return (
                      <div
                        key={file.file_url}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {/* 이미지 미리보기 또는 아이콘 */}
                        {isImage ? (
                          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100">
                            <Image
                              src={file.file_url}
                              alt={file.file_name}
                              fill
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                            <FileIconComponent className="h-6 w-6 text-gray-500" />
                          </div>
                        )}

                        {/* 파일 정보 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>

                        {/* 다운로드 버튼 */}
                        {canDownloadFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file)}
                            className="flex-shrink-0 gap-2"
                          >
                            <Download className="h-4 w-4" />
                            다운로드
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        {(canEdit || canDelete) && (
          <CardFooter className="justify-end">
            <div className="flex items-center justify-end gap-3">
              {
                canDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                )
              }
              {canEdit && (
                <Button
                  variant="default"
                  onClick={() => {
                    const editPath = isPublic
                      ? `/boards/${boardId}/${post.id}/edit`
                      : `/admin/boards/${boardId}/${post.id}/edit`;
                    router.push(editPath);
                  }}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  수정
                </Button>
              )}
            </div>
          </CardFooter>
        )}

      </Card>



      {/* 댓글 섹션 */}
      {allowComment && <Comments
        postId={post.id}
        permissions={{
          cmt_create: permissions?.cmt_create,
          cmt_read: permissions?.cmt_read,
          cmt_edit: permissions?.cmt_edit,
          cmt_delete: permissions?.cmt_delete,
        }}
        isAdmin={isAdmin}
        comments={comments}
      />}

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
    </>
  );
}

