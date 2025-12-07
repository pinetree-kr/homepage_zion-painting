-- ============================================================================
-- 마이그레이션: 댓글 삭제 로그에 시도자 정보 기록
-- ============================================================================
-- 
-- 문제: 댓글 삭제 로그에 댓글 작성자 정보가 기록되고 있음
--      삭제를 시도한 사람(시도자)의 정보가 기록되어야 함
-- 
-- 해결: auth.uid()를 사용하여 시도자 정보를 가져오도록 수정
--      댓글 작성자 정보는 metadata에 추가로 저장
-- ============================================================================

-- 댓글 삭제 로그 트리거 함수 수정
CREATE OR REPLACE FUNCTION log_comment_delete()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
  post_title_val VARCHAR(255);
  is_admin_user BOOLEAN;
  comment_author_id UUID;
  comment_author_name VARCHAR(255);
BEGIN
  -- RLS 우회: SECURITY DEFINER 함수 내에서 RLS를 비활성화하여
  -- 트리거 실행 시 comments 테이블의 RLS 정책으로 인한 오류 방지
  SET LOCAL row_security = off;
  
  -- soft delete인 경우 (deleted_at이 설정된 경우)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- 댓글 작성자 정보 저장 (metadata에 포함)
    comment_author_id := OLD.author_id;
    comment_author_name := COALESCE(OLD.author_name, '익명');
    
    -- 삭제를 시도한 사용자 정보 가져오기 (auth.uid() 사용)
    user_id_val := auth.uid();
    
    IF user_id_val IS NOT NULL THEN
      -- 시도자 이름 가져오기
      SELECT name INTO user_name_val
      FROM profiles
      WHERE id = user_id_val;
      
      IF user_name_val IS NULL OR user_name_val = '' THEN
        user_name_val := '알 수 없음';
      END IF;
      
      -- 시도자가 관리자인지 확인
      SELECT EXISTS (
        SELECT 1 FROM administrators
        WHERE id = user_id_val
        AND deleted_at IS NULL
      ) INTO is_admin_user;
    ELSE
      user_name_val := '시스템';
      is_admin_user := FALSE;
    END IF;
    
    -- 게시글 및 게시판 정보 가져오기
    SELECT 
      b.name, 
      b.code,
      p.title
    INTO 
      board_name_val, 
      board_code_val,
      post_title_val
    FROM posts p
    JOIN boards b ON p.board_id = b.id
    WHERE p.id = OLD.post_id;
    
    -- 게시판 정보가 없는 경우 처리
    IF board_name_val IS NULL THEN
      board_name_val := '알 수 없음';
      board_code_val := 'unknown';
    END IF;
    
    IF post_title_val IS NULL THEN
      post_title_val := '알 수 없음';
    END IF;
    
    -- 관리자가 아닌 경우에만 일반 댓글 삭제 로그 기록
    -- (관리자 답변 삭제는 별도 처리)
    IF NOT is_admin_user OR comment_author_id IS NULL OR comment_author_id != user_id_val THEN
      -- 활동 로그 생성 (시도자 정보 기록)
      INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
      VALUES (
        user_id_val,
        user_name_val,
        'COMMENT_DELETE',
        '댓글 삭제',
        board_name_val || ' 게시글의 댓글 삭제',
        jsonb_build_object(
          'boardName', board_name_val,
          'boardCode', board_code_val,
          'postId', OLD.post_id,
          'postTitle', post_title_val,
          'commentId', OLD.id,
          'commentAuthorId', comment_author_id,
          'commentAuthorName', comment_author_name
        ),
        NULL  -- IP 주소는 삭제 시도자의 것이므로 NULL (댓글 작성 시 IP와 다를 수 있음)
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '댓글 삭제 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


DROP POLICY IF EXISTS "Public read access for comments on published posts" ON comments;
CREATE POLICY "Public read access for comments on published posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.status = 'published'
      AND posts.deleted_at IS NULL
    )
  );