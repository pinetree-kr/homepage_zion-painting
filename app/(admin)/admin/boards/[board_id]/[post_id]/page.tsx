import PostDetail from '@/src/features/post/ui/PostDetail';
import { getBoardInfoUsingAdminById, getBoardPoliciesUsingAnonymous } from '@/src/features/board/api/board-actions';
import { getPostUsingAdmin } from '@/src/features/post/api/post-actions';
import { getPostFiles } from '@/src/features/post/api/post-file-actions';
import { getCommentsByPostId } from '@/src/features/comment/api/comment-actions';
import { getUserRole } from '@/src/entities/user/model/checkPermission';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/src/shared/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PostDetailPageProps {
  params: Promise<{
    post_id: string;
    board_id: string;
  }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { post_id, board_id } = await params;
  const boardInfo = await getBoardInfoUsingAdminById(board_id);
  const boardPolicies = await getBoardPoliciesUsingAnonymous(board_id);
  if (!boardInfo) {
    return notFound();
  }
  const post = await getPostUsingAdmin(post_id);

  if (!post) {
    redirect(`/admin/boards/${board_id}`);
  }

  // 사용자 롤 및 프로필 확인
  const userRoleInfo = await getUserRole();
  const isAdmin = userRoleInfo?.role === 'admin';
  const isAuthor = userRoleInfo?.user_id === post.author_id;

  // 관리자 정책 찾기 (관리자 페이지이므로 admin 정책 사용)
  const adminPolicy = boardPolicies.find(p => p.role === 'admin');
  const permissions = adminPolicy ? {
    post_read: adminPolicy.post_read,
    post_edit: adminPolicy.post_edit,
    post_delete: adminPolicy.post_delete,
    cmt_create: adminPolicy.cmt_create,
    cmt_read: adminPolicy.cmt_read,
    cmt_edit: adminPolicy.cmt_edit,
    cmt_delete: adminPolicy.cmt_delete,
    file_download: adminPolicy.file_download,
  } : {
    post_read: true,
    post_edit: true,
    post_delete: true,
    cmt_create: true,
    cmt_read: true,
    cmt_edit: true,
    cmt_delete: true,
    file_download: true,
  };

  // 첨부 파일 목록 가져오기
  const attachedFiles = await getPostFiles(post_id);

  // 댓글 목록 가져오기 (서버사이드)
  const initialComments = permissions.cmt_read ? await getCommentsByPostId(post_id) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link passHref href={`/admin/boards/${board_id}`}>
          <Button
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> 목록으로
          </Button>
        </Link>
      </div>

      <PostDetail
        post={post}
        boardId={boardInfo.id}
        boardCode={boardInfo.code}
        boardName={boardInfo.name}
        attachedFiles={attachedFiles}
        isPublic={false}
        isAdmin={isAdmin}
        isAuthor={isAuthor}
        permissions={permissions}
        comments={initialComments}
      />
    </div>
  );
}

