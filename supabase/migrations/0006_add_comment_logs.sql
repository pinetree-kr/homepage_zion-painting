-- ============================================================================
-- 마이그레이션: 댓글 작성/수정/삭제 로그 추가
-- ============================================================================
-- 
-- 목적: 일반 사용자의 댓글 작성, 수정, 삭제 활동을 로그로 기록
-- 
-- 추가 내용:
-- 1. log_type ENUM에 COMMENT_CREATE, COMMENT_UPDATE, COMMENT_DELETE 추가
-- 2. 댓글 작성/수정/삭제 트리거 함수 생성
-- 3. 트리거 생성
-- ============================================================================

-- 1. log_type ENUM에 댓글 관련 타입 추가
ALTER TYPE log_type ADD VALUE IF NOT EXISTS 'COMMENT_CREATE';
ALTER TYPE log_type ADD VALUE IF NOT EXISTS 'COMMENT_UPDATE';
ALTER TYPE log_type ADD VALUE IF NOT EXISTS 'COMMENT_DELETE';

-- 2. 댓글 작성 로그 트리거 함수
CREATE OR REPLACE FUNCTION log_comment_create()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
  post_title_val VARCHAR(255);
  is_admin_user BOOLEAN;
BEGIN
  -- RLS 우회: SECURITY DEFINER 함수 내에서 RLS를 비활성화하여
  -- 트리거 실행 시 comments 테이블의 RLS 정책으로 인한 오류 방지
  SET LOCAL row_security = off;
  
  -- 작성자 정보
  user_id_val := NEW.author_id;
  user_name_val := COALESCE(NEW.author_name, '익명');
  
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
  WHERE p.id = NEW.post_id;
  
  -- 게시판 정보가 없는 경우 처리
  IF board_name_val IS NULL THEN
    board_name_val := '알 수 없음';
    board_code_val := 'unknown';
  END IF;
  
  IF post_title_val IS NULL THEN
    post_title_val := '알 수 없음';
  END IF;
  
  -- 작성자가 관리자인지 확인 (관리자 답변은 별도 로그로 기록되므로 제외)
  IF user_id_val IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM administrators
      WHERE id = user_id_val
      AND deleted_at IS NULL
    ) INTO is_admin_user;
    
    -- 관리자가 아닌 경우에만 일반 댓글 로그 기록
    -- (관리자 답변은 log_post_answer 트리거에서 처리)
    IF NOT is_admin_user THEN
      -- 활동 로그 생성
      INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
      VALUES (
        user_id_val,
        user_name_val,
        'COMMENT_CREATE',
        '댓글 작성',
        board_name_val || ' 게시글에 댓글 작성',
        jsonb_build_object(
          'boardName', board_name_val,
          'boardCode', board_code_val,
          'postId', NEW.post_id,
          'postTitle', post_title_val,
          'commentId', NEW.id,
          'parentId', NEW.parent_id
        ),
        CASE 
          WHEN NEW.author_ip IS NOT NULL AND NEW.author_ip != '' 
          THEN NEW.author_ip::inet 
          ELSE NULL 
        END
      );
    END IF;
  ELSE
    -- 익명 사용자의 경우에도 로그 기록
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
    VALUES (
      NULL,
      user_name_val,
      'COMMENT_CREATE',
      '댓글 작성',
      board_name_val || ' 게시글에 댓글 작성',
      jsonb_build_object(
        'boardName', board_name_val,
        'boardCode', board_code_val,
        'postId', NEW.post_id,
        'postTitle', post_title_val,
        'commentId', NEW.id,
        'parentId', NEW.parent_id
      ),
      CASE 
        WHEN NEW.author_ip IS NOT NULL AND NEW.author_ip != '' 
        THEN NEW.author_ip::inet 
        ELSE NULL 
      END
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '댓글 작성 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 댓글 수정 로그 트리거 함수
CREATE OR REPLACE FUNCTION log_comment_update()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
  post_title_val VARCHAR(255);
  is_admin_user BOOLEAN;
BEGIN
  -- RLS 우회: SECURITY DEFINER 함수 내에서 RLS를 비활성화하여
  -- 트리거 실행 시 comments 테이블의 RLS 정책으로 인한 오류 방지
  SET LOCAL row_security = off;
  
  -- 내용이 변경된 경우에만 로그 기록
  IF OLD.context IS DISTINCT FROM NEW.context THEN
    -- 작성자 정보
    user_id_val := NEW.author_id;
    user_name_val := COALESCE(NEW.author_name, '익명');
    
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
    WHERE p.id = NEW.post_id;
    
    -- 게시판 정보가 없는 경우 처리
    IF board_name_val IS NULL THEN
      board_name_val := '알 수 없음';
      board_code_val := 'unknown';
    END IF;
    
    IF post_title_val IS NULL THEN
      post_title_val := '알 수 없음';
    END IF;
    
    -- 작성자가 관리자인지 확인
    IF user_id_val IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM administrators
        WHERE id = user_id_val
        AND deleted_at IS NULL
      ) INTO is_admin_user;
      
      -- 관리자가 아닌 경우에만 일반 댓글 수정 로그 기록
      IF NOT is_admin_user THEN
        -- 활동 로그 생성
        INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
        VALUES (
          user_id_val,
          user_name_val,
          'COMMENT_UPDATE',
          '댓글 수정',
          board_name_val || ' 게시글의 댓글 수정',
          jsonb_build_object(
            'boardName', board_name_val,
            'boardCode', board_code_val,
            'postId', NEW.post_id,
            'postTitle', post_title_val,
            'commentId', NEW.id
          ),
          CASE 
            WHEN NEW.author_ip IS NOT NULL AND NEW.author_ip != '' 
            THEN NEW.author_ip::inet 
            ELSE NULL 
          END
        );
      END IF;
    ELSE
      -- 익명 사용자의 경우에도 로그 기록
      INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
      VALUES (
        NULL,
        user_name_val,
        'COMMENT_UPDATE',
        '댓글 수정',
        board_name_val || ' 게시글의 댓글 수정',
        jsonb_build_object(
          'boardName', board_name_val,
          'boardCode', board_code_val,
          'postId', NEW.post_id,
          'postTitle', post_title_val,
          'commentId', NEW.id
        ),
        CASE 
          WHEN NEW.author_ip IS NOT NULL AND NEW.author_ip != '' 
          THEN NEW.author_ip::inet 
          ELSE NULL 
        END
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '댓글 수정 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. 댓글 삭제 로그 트리거 함수
CREATE OR REPLACE FUNCTION log_comment_delete()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
  post_title_val VARCHAR(255);
  is_admin_user BOOLEAN;
BEGIN
  -- RLS 우회: SECURITY DEFINER 함수 내에서 RLS를 비활성화하여
  -- 트리거 실행 시 comments 테이블의 RLS 정책으로 인한 오류 방지
  SET LOCAL row_security = off;
  
  -- soft delete인 경우 (deleted_at이 설정된 경우)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- 작성자 정보
    user_id_val := OLD.author_id;
    user_name_val := COALESCE(OLD.author_name, '익명');
    
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
    
    -- 작성자가 관리자인지 확인
    IF user_id_val IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM administrators
        WHERE id = user_id_val
        AND deleted_at IS NULL
      ) INTO is_admin_user;
      
      -- 관리자가 아닌 경우에만 일반 댓글 삭제 로그 기록
      IF NOT is_admin_user THEN
        -- 활동 로그 생성
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
            'commentId', OLD.id
          ),
          CASE 
            WHEN OLD.author_ip IS NOT NULL AND OLD.author_ip != '' 
            THEN OLD.author_ip::inet 
            ELSE NULL 
          END
        );
      END IF;
    ELSE
      -- 익명 사용자의 경우에도 로그 기록
      INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
      VALUES (
        NULL,
        user_name_val,
        'COMMENT_DELETE',
        '댓글 삭제',
        board_name_val || ' 게시글의 댓글 삭제',
        jsonb_build_object(
          'boardName', board_name_val,
          'boardCode', board_code_val,
          'postId', OLD.post_id,
          'postTitle', post_title_val,
          'commentId', OLD.id
        ),
        CASE 
          WHEN OLD.author_ip IS NOT NULL AND OLD.author_ip != '' 
          THEN OLD.author_ip::inet 
          ELSE NULL 
        END
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

-- 5. 트리거 생성
DROP TRIGGER IF EXISTS on_comment_create ON comments;
CREATE TRIGGER on_comment_create
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION log_comment_create();

DROP TRIGGER IF EXISTS on_comment_update ON comments;
CREATE TRIGGER on_comment_update
  AFTER UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION log_comment_update();

DROP TRIGGER IF EXISTS on_comment_delete ON comments;
CREATE TRIGGER on_comment_delete
  AFTER UPDATE ON comments
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION log_comment_delete();
