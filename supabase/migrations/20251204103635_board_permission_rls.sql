-- 게시판 권한 매트릭스 기반 RLS 정책 추가
-- board_policies를 활용한 세밀한 권한 제어

-- ============================================================================
-- 1. 권한 체크를 위한 헬퍼 함수 생성
-- ============================================================================

-- board_policies에서 특정 권한이 허용되어 있는지 확인하는 함수
-- SECURITY DEFINER로 설정하여 RLS를 우회하여 권한 정보를 조회할 수 있습니다
CREATE OR REPLACE FUNCTION check_board_permission(
  p_board_id UUID,
  p_user_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM board_policies bp
    WHERE bp.board_id = p_board_id
      AND bp.role = 'member'::app_role
      AND (
        (p_permission = 'post_edit' AND bp.post_edit = TRUE) OR
        (p_permission = 'post_delete' AND bp.post_delete = TRUE) OR
        (p_permission = 'cmt_edit' AND bp.cmt_edit = TRUE) OR
        (p_permission = 'cmt_delete' AND bp.cmt_delete = TRUE)
      )
  );
$$;

-- ============================================================================
-- 2. 기존 posts 테이블 RLS 정책 삭제 및 재생성
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Public read access for published posts" ON posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can delete posts" ON posts;

-- 새로운 SELECT 정책: visibility='owner'인 게시판은 본인 게시물만 조회 가능
CREATE POLICY "Public read access for published posts" ON posts
  FOR SELECT USING (
    deleted_at IS NULL 
    AND status = 'published'
    AND (
      -- 관리자는 모든 게시물 조회 가능
      is_admin(auth.uid()) OR
      -- visibility가 'owner'가 아닌 게시판의 게시물은 모두 조회 가능
      NOT EXISTS (
        SELECT 1 FROM boards 
        WHERE boards.id = posts.board_id 
        AND boards.visibility = 'owner'::visible_type
        AND boards.deleted_at IS NULL
      ) OR
      -- visibility가 'owner'인 게시판의 경우 본인 게시물만 조회 가능
      (
        EXISTS (
          SELECT 1 FROM boards 
          WHERE boards.id = posts.board_id 
          AND boards.visibility = 'owner'::visible_type
          AND boards.deleted_at IS NULL
        )
        AND auth.uid() = posts.author_id
      )
    )
  );

-- 작성자는 본인 게시물 조회 가능 (draft 포함)
CREATE POLICY "Authors can view own posts" ON posts
  FOR SELECT USING (
    auth.uid() = author_id 
    AND deleted_at IS NULL
  );

-- UPDATE 정책: board_policies 기반 권한 체크
CREATE POLICY "Members can update own posts with permission" ON posts
  FOR UPDATE USING (
    -- 관리자는 모든 게시물 수정 가능
    is_admin(auth.uid()) OR
    -- 일반 사용자는 본인 게시물이고 권한이 있을 때만 수정 가능
    (
      auth.uid() = author_id
      AND NOT is_admin(auth.uid())
      AND check_board_permission(board_id, auth.uid(), 'post_edit')
    )
  );

-- DELETE 정책: board_policies 기반 권한 체크
CREATE POLICY "Members can delete own posts with permission" ON posts
  FOR UPDATE USING (
    -- 관리자는 모든 게시물 삭제 가능
    is_admin(auth.uid()) OR
    -- 일반 사용자는 본인 게시물이고 권한이 있을 때만 삭제 가능
    (
      auth.uid() = author_id
      AND NOT is_admin(auth.uid())
      AND check_board_permission(board_id, auth.uid(), 'post_delete')
    )
  );

-- ============================================================================
-- 3. 기존 comments 테이블 RLS 정책 삭제 및 재생성
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authors can update own comments" ON comments;
DROP POLICY IF EXISTS "Authors and admins can delete comments" ON comments;

-- UPDATE 정책: board_policies 기반 권한 체크
CREATE POLICY "Members can update own comments with permission" ON comments
  FOR UPDATE USING (
    -- 관리자는 모든 댓글 수정 가능
    is_admin(auth.uid()) OR
    -- 일반 사용자는 본인 댓글이고 권한이 있을 때만 수정 가능
    (
      auth.uid() = author_id
      AND NOT is_admin(auth.uid())
      AND EXISTS (
        SELECT 1 FROM posts
        WHERE posts.id = comments.post_id
        AND check_board_permission(posts.board_id, auth.uid(), 'cmt_edit')
      )
    )
  );

-- DELETE 정책: board_policies 기반 권한 체크
CREATE POLICY "Members can delete own comments with permission" ON comments
  FOR UPDATE USING (
    -- 관리자는 모든 댓글 삭제 가능
    is_admin(auth.uid()) OR
    -- 일반 사용자는 본인 댓글이고 권한이 있을 때만 삭제 가능
    (
      auth.uid() = author_id
      AND NOT is_admin(auth.uid())
      AND EXISTS (
        SELECT 1 FROM posts
        WHERE posts.id = comments.post_id
        AND check_board_permission(posts.board_id, auth.uid(), 'cmt_delete')
      )
    )
  );

-- ============================================================================
-- 4. board_policies 테이블 RLS 활성화 및 정책 추가
-- ============================================================================

ALTER TABLE board_policies ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 board_policies 조회 가능
CREATE POLICY "Admins can view all board_policies" ON board_policies
  FOR SELECT USING (is_admin(auth.uid()));

-- 일반 사용자는 member 역할의 정책만 조회 가능
CREATE POLICY "Members can view member role policies" ON board_policies
  FOR SELECT USING (
    role = 'member'::app_role
    AND auth.uid() IS NOT NULL
  );

-- 관리자만 board_policies 수정 가능
CREATE POLICY "Admins can manage board_policies" ON board_policies
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

