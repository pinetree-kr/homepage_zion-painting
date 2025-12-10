import { notFound, redirect } from 'next/navigation';
import { searchPostsByBoardIdUsing1To1Board } from '@/src/features/post/api/post-actions';
import { getSiteSettings } from '@/src/features/post/api/post-actions';
import { getUserRole } from '@/src/entities/user/model/checkPermission';
import { getBoardInfoByIdUsingAnonymous } from '@/src/features/board/api/board-actions';
import PublicPosts from '@/src/features/post/ui/PublicPosts';
import PostCreateButton from '@/src/features/post/ui/PostCreateButton';
import { Post } from '@/src/entities/post/model/types';
import { Container } from '@/src/shared/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface InquiriesPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function InquiriesPage({ searchParams }: InquiriesPageProps) {
  const searchParamsData = await searchParams;

  // 사용자 인증 확인
  const userRoleInfo = await getUserRole();
  if (!userRoleInfo) {
    redirect('/auth/sign-in');
  }

  // site_settings에서 inquiry 게시판 ID 가져오기
  const siteSettings = await getSiteSettings();
  const inquiryBoardId = siteSettings?.default_boards?.inquiry?.id;

  if (!inquiryBoardId) {
    return (
      <Container className="lg:max-w-6xl mx-auto">
        <div className="p-8 text-center">
          <p className="text-gray-500">1:1 문의 게시판이 설정되지 않았습니다.</p>
        </div>
      </Container>
    );
  }

  // 게시판 정보 조회
  const boardInfo = await getBoardInfoByIdUsingAnonymous(inquiryBoardId);
  if (!boardInfo) {
    return notFound();
  }

  const searchTerm = searchParamsData?.search || '';
  const page = parseInt(searchParamsData?.page || '1', 10);
  const sortColumn = searchParamsData?.sort || null;
  const sortDirection = (searchParamsData?.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  // 사용자 본인의 게시글만 조회
  const result = await searchPostsByBoardIdUsing1To1Board(
    inquiryBoardId,
    userRoleInfo.user_id,
    searchTerm,
    page,
    ITEMS_PER_PAGE,
    sortColumn,
    sortDirection
  );

  return (
    <Container className="lg:max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-normal text-[#101828]">1:1 문의 내역</h1>
          <p className="text-base text-[#4D4D4D] mt-2">
            작성하신 문의글을 확인할 수 있습니다
          </p>
        </div>

        <PublicPosts
          boardId={inquiryBoardId}
          boardName={boardInfo.name}
          items={result?.data || []}
          totalItems={result?.total || 0}
          totalPages={result?.totalPages || 0}
          currentPage={page}
          searchTerm={searchTerm}
          createButton={
            <PostCreateButton boardId={inquiryBoardId} allowWrite={true} />
          }
        />
      </div>
    </Container>
  );
}
