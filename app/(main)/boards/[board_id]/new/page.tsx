import { notFound } from 'next/navigation';
import { getBoardInfoByIdUsingAnonymous, getBoardPoliciesUsingAnonymous, checkBoardSupportsProductLinkingUsingAnonymous } from '@/src/features/board/api/board-actions';
import PostForm from '@/src/features/post/ui/PostForm';
import { getUserRole } from '@/src/entities/user/model/checkPermission';
import BoardError from '../error';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

interface NewPostPageProps {
  params: Promise<{
    board_id: string;
  }>;
}

export default async function NewPostPage({ params }: NewPostPageProps) {
  const { board_id } = await params;

  // board_id는 필수
  if (!board_id) {
    return notFound();
  }

  // 게시판 정보 조회
  const boardInfo = await getBoardInfoByIdUsingAnonymous(board_id);
  const boardPolicies = await getBoardPoliciesUsingAnonymous(board_id);

  if (!boardInfo) {
    return notFound();
  }

  // 사용자 롤 확인
  const userRoleInfo = await getUserRole();

  // 권한 체크: 쓰기 권한
  const canWrite = boardPolicies.find(p => p.role === userRoleInfo?.role)?.post_create ?? false;

  if (!canWrite) {
    if (userRoleInfo == null) {
      return (
        <BoardError statusCode={401} error={new Error('로그인이 필요합니다.')} />
      );
    } else {
      return (
        <BoardError statusCode={403} error={new Error('게시글 작성 권한이 없습니다.')} />
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
          redirectPath={`/boards/${board_id}`}
          hideStatusField={true}
        />
      </div>
    </div>
  );
}

