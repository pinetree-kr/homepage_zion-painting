import { notFound } from 'next/navigation';
import { getBoardInfoByIdUsingAnonymous, getBoardPoliciesUsingAnonymous, checkBoardSupportsProductLinkingUsingAnonymous } from '@/src/features/board/api/board-actions';
import PostForm from '@/src/features/post/ui/PostForm';
import { getUserRole } from '@/src/entities/user/model/checkPermission';
import { getCurrentUserProfile } from '@/src/entities/user/model/getCurrentUser';
import { createServerClient } from '@/src/shared/lib/supabase/server';
import type { Post } from '@/src/entities/post/model/types';
import BoardError from '../error';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

interface EditPostPageProps {
  params: Promise<{
    board_id: string;
    post_id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
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

  // 사용자 인증 확인
  const supabase = await createServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <BoardError statusCode={401} error={new Error('로그인이 필요합니다.')} />
    );
  }

  // 현재 사용자 프로필 확인
  const currentUser = await getCurrentUserProfile();
  if (!currentUser) {
    return (
      <BoardError statusCode={401} error={new Error('사용자 정보를 가져올 수 없습니다.')} />
    );
  }

  // 게시글 조회 (작성자 본인은 draft도 조회 가능)
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', post_id)
    .is('deleted_at', null)
    .maybeSingle() as {
      data: Post | null;
      error: any;
    };

  if (postError || !post) {
    return notFound();
  }

  // 게시글이 해당 게시판에 속하는지 확인
  if (post.board_id !== board_id) {
    return notFound();
  }

  // 사용자 롤 확인
  const userRoleInfo = await getUserRole();

  // 관리자는 모든 게시글 수정 가능
  const isAdmin = userRoleInfo?.role === 'admin';

  // 작성자 본인인지 확인
  const isAuthor = post.author_id === currentUser.id;

  // 수정 권한 체크: 관리자이거나 작성자 본인이어야 함
  if (!isAdmin && !isAuthor) {
    return (
      <BoardError statusCode={403} error={new Error('게시글 수정 권한이 없습니다.')} />
    );
  }

  // 게시판 수정 권한 체크 (일반 사용자용)
  if (!isAdmin) {
    const canEdit = boardPolicies.find(p => p.role === userRoleInfo?.role)?.post_edit ?? false;
    if (!canEdit) {
      return (
        <BoardError statusCode={403} error={new Error('게시글 수정 권한이 없습니다.')} />
      );
    }
  }

  // 서버 사이드에서 board_id 기반으로 제품 연결 가능 여부 확인 (일반 사용자용)
  const allowProductLink = await checkBoardSupportsProductLinkingUsingAnonymous(board_id);
  // 서버 사이드에서 파일 업로드 권한 확인 (현재 사용자 역할의 file_upload 권한)
  const allowFile = boardPolicies.find(p => p.role === userRoleInfo?.role)?.file_upload ?? false;

  return (
    <div className="relative bg-[#F4F6F8] min-h-[calc(100vh-405px)]">
      <div className="lg:max-w-6xl mx-auto px-4 pt-24 pb-8 md:pt-34 md:pb-18">
        <PostForm
          boardCode={boardInfo.code}
          boardId={boardInfo.id}
          boardName={boardInfo.name}
          allowGuest={false}
          allowProductLink={allowProductLink}
          allowFile={allowFile}
          postId={post_id}
          data={post}
          redirectPath={`/boards/${board_id}`}
          hideStatusField={true}
        />
      </div>
    </div>
  );
}

