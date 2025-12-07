import { notFound, redirect } from 'next/navigation';
import { getBoardInfoByIdUsingAnonymous, getBoardPoliciesUsingAnonymous } from '@/src/features/board/api/board-actions';
import { getPostUsingAnonymous } from '@/src/features/post/api/post-actions';
import { getPostFiles } from '@/src/features/post/api/post-file-actions';
import { getCommentsByPostId } from '@/src/features/comment/api/comment-actions';
import PostDetail from '@/src/features/post/ui/PostDetail';
import { Button } from '@/src/shared/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getUserRole } from '@/src/entities/user/model/checkPermission';
import { getCurrentUserProfile } from '@/src/entities/user/model/getCurrentUser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

interface BoardsPageProps {
  params: Promise<{
    board_id: string;
    post_id: string;
  }>;
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string | null;
    order?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function BoardsPage({ params, searchParams }: BoardsPageProps) {
  const searchParamsData = await searchParams;
  const { board_id, post_id } = await params;

  // board_id와 post_id는 필수
  if (!board_id || !post_id) {
    return notFound();
  }

  // 게시판 정보 조회
  const boardInfo = await getBoardInfoByIdUsingAnonymous(board_id);
  const boardPolicies = await getBoardPoliciesUsingAnonymous(board_id);

  if (!boardInfo) {
    return notFound();
  }

  if (!post_id) {
    return notFound();
  }

  const post = await getPostUsingAnonymous(post_id);

  if (!post) {
    return notFound();
  }

  // 사용자 롤 및 프로필 확인
  const userRoleInfo = await getUserRole();
  const isAdmin = userRoleInfo?.role === 'admin';
  const isAuthor = userRoleInfo?.user_id == post.author_id;

  // 권한체크

  // 사용자 역할에 맞는 정책 찾기 (app_role 기반)
  const userPolicy = boardPolicies.find(p => p.role === userRoleInfo?.role)

  const defaultPolicy = boardPolicies.find(p => p.role === 'member');
  // 비로그인 사용자는 visibility에 따라 적용되는 정책을 결정
  const appliedPolicy = userPolicy ?? {
    post_read: (boardInfo.visibility === 'public' && defaultPolicy?.post_read) ?? false,
    post_edit: false,
    post_delete: false,
    cmt_create: false,
    cmt_read: (boardInfo.visibility === 'public' && defaultPolicy?.cmt_read) ?? false,
    cmt_edit: false,
    cmt_delete: false,
    file_download: (boardInfo.visibility === 'public' && defaultPolicy?.file_download) ?? false,
  };


  // 읽기 권한이 없으면 404
  if (!appliedPolicy.post_read) {
    return notFound();
  }

  // 첨부 파일 목록 가져오기
  const attachedFiles = await getPostFiles(post_id);

  // 댓글 목록 가져오기 (서버사이드)
  const comments = appliedPolicy.cmt_read ? await getCommentsByPostId(post_id) : [];

  return (
    <div className="relative bg-[#F4F6F8] min-h-[calc(100vh-405px)]">
      <div className="lg:max-w-6xl mx-auto px-4 pt-24 pb-8 md:pt-34 md:pb-18">
        <div className="space-y-6">
          <div className="flex items-center">
            <Link href={`/boards/${board_id}`}>
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
            isPublic={true}
            isAdmin={isAdmin}
            isAuthor={isAuthor}
            permissions={appliedPolicy}
            comments={comments}
          />
        </div>
      </div>
    </div>
  );
}
