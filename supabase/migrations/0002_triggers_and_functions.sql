-- ============================================================================
-- 트리거와 함수 정의
-- ============================================================================

-- ============================================================================
-- 1. updated_at 자동 업데이트 함수 및 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 추가
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_administrators_updated_at BEFORE UPDATE ON administrators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_categories_updated_at BEFORE UPDATE ON business_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_achievements_updated_at BEFORE UPDATE ON business_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_inquiries_updated_at BEFORE UPDATE ON product_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_board_policies_updated_at BEFORE UPDATE ON board_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. 관리자 여부 확인 함수
-- ============================================================================

-- 관리자 여부를 확인하는 SECURITY DEFINER 함수 생성
-- 이 함수는 RLS를 우회하여 무한 재귀 없이 관리자 여부를 확인할 수 있습니다
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM administrators 
    WHERE administrators.id = user_id
    AND administrators.deleted_at IS NULL
  );
$$;

-- ============================================================================
-- 3. 사용자 가입 시 프로필 자동 생성 트리거
-- ============================================================================

-- 사용자 가입 시 프로필 자동 생성 트리거 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 사용자 가입 시 프로필 자동 생성 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 4. 권한 체크를 위한 헬퍼 함수
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
-- 5. 로그 자동 정리 함수
-- ============================================================================

-- 90일 이상 된 로그를 자동으로 삭제하는 함수
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 90일 이상 된 로그 삭제 (기간은 필요에 따라 조정)
  DELETE FROM activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- 6. 활동 로그 자동 생성 트리거 함수들
-- ============================================================================
-- 
-- 주의사항:
-- - 데이터베이스 트리거는 HTTP 요청의 IP 주소나 User-Agent에 직접 접근할 수 없습니다.
-- - IP 주소가 필요한 경우, 애플리케이션 코드에서 직접 로그를 기록해야 합니다.
-- - 트리거는 자동화된 로깅을 위해 사용되며, IP 주소는 NULL로 기록됩니다.
-- - IP 주소가 필요한 로그(예: 로그인 실패, 관리자 로그인)는 애플리케이션 코드에서 처리해야합니다.
-- ============================================================================

-- 6-1. 사용자 가입 로그 트리거
CREATE OR REPLACE FUNCTION log_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_name_val VARCHAR(255);
BEGIN
  -- profiles 테이블이 아직 생성되지 않았을 수 있으므로, 
  -- raw_user_meta_data에서 먼저 가져오고, 없으면 이메일 사용
  user_name_val := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    '알 수 없음'
  );
  
  -- profiles 테이블에서 이름을 다시 확인 (트리거 순서 문제 대비)
  -- handle_new_user 트리거가 먼저 실행되었을 수 있으므로
  BEGIN
    SELECT name INTO user_name_val
    FROM profiles
    WHERE id = NEW.id;
    
    IF user_name_val IS NULL OR user_name_val = '' THEN
      user_name_val := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.email,
        '알 수 없음'
      );
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- profiles 테이블이 아직 없으면 raw_user_meta_data 사용
      user_name_val := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.email,
        '알 수 없음'
      );
  END;
  
  -- 활동 로그 생성
  INSERT INTO activity_logs (user_id, user_name, log_type, action, details)
  VALUES (
    NEW.id,
    user_name_val,
    'USER_SIGNUP',
    '사용자 가입',
    '일반 사용자 가입 완료'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 로그 생성 실패해도 사용자 가입은 계속 진행
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 사용자 가입 트리거 생성
DROP TRIGGER IF EXISTS on_user_signup ON auth.users;
CREATE TRIGGER on_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION log_user_signup();

-- 6-2. 관리자 가입 로그 트리거
CREATE OR REPLACE FUNCTION log_admin_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_name_val VARCHAR(255);
BEGIN
  -- 사용자 이름 가져오기 (profiles 테이블에서)
  SELECT name INTO user_name_val
  FROM profiles
  WHERE id = NEW.id;
  
  -- 이름이 없으면 이메일 사용
  IF user_name_val IS NULL OR user_name_val = '' THEN
    SELECT email INTO user_name_val
    FROM profiles
    WHERE id = NEW.id;
    
    IF user_name_val IS NULL OR user_name_val = '' THEN
      user_name_val := '알 수 없음';
    END IF;
  END IF;
  
  -- 활동 로그 생성
  INSERT INTO activity_logs (user_id, user_name, log_type, action, details)
  VALUES (
    NEW.id,
    user_name_val,
    'ADMIN_SIGNUP',
    '관리자 가입',
    '새 관리자 계정 생성'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 로그 생성 실패해도 관리자 가입은 계속 진행
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 관리자 가입 트리거 생성
DROP TRIGGER IF EXISTS on_admin_signup ON administrators;
CREATE TRIGGER on_admin_signup
  AFTER INSERT ON administrators
  FOR EACH ROW EXECUTE FUNCTION log_admin_signup();

-- 6-3. 게시판 생성/삭제 로그 트리거
CREATE OR REPLACE FUNCTION log_board_create()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
BEGIN
  -- 현재 사용자 정보 가져오기
  user_id_val := auth.uid();
  
  IF user_id_val IS NOT NULL THEN
    SELECT name INTO user_name_val
    FROM profiles
    WHERE id = user_id_val;
    
    IF user_name_val IS NULL OR user_name_val = '' THEN
      user_name_val := '알 수 없음';
    END IF;
  ELSE
    user_name_val := '시스템';
  END IF;
  
  -- 활동 로그 생성
  INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
  VALUES (
    user_id_val,
    user_name_val,
    'BOARD_CREATE',
    '게시판 생성',
    '새 게시판 생성: ' || NEW.name,
    jsonb_build_object('boardName', NEW.name)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

CREATE OR REPLACE FUNCTION log_board_delete()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
BEGIN
  -- soft delete인 경우 (deleted_at이 설정된 경우)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- 현재 사용자 정보 가져오기
    user_id_val := auth.uid();
    
    IF user_id_val IS NOT NULL THEN
      SELECT name INTO user_name_val
      FROM profiles
      WHERE id = user_id_val;
      
      IF user_name_val IS NULL OR user_name_val = '' THEN
        user_name_val := '알 수 없음';
      END IF;
    ELSE
      user_name_val := '시스템';
    END IF;
    
    -- 활동 로그 생성
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
    VALUES (
      user_id_val,
      user_name_val,
      'BOARD_DELETE',
      '게시판 삭제',
      '게시판 삭제: ' || OLD.name,
      jsonb_build_object('boardName', OLD.name)
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 게시판 트리거 생성
DROP TRIGGER IF EXISTS on_board_create ON boards;
CREATE TRIGGER on_board_create
  AFTER INSERT ON boards
  FOR EACH ROW EXECUTE FUNCTION log_board_create();

DROP TRIGGER IF EXISTS on_board_delete ON boards;
CREATE TRIGGER on_board_delete
  AFTER UPDATE ON boards
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION log_board_delete();

-- 6-4. 게시글 생성/수정/삭제 로그 트리거
CREATE OR REPLACE FUNCTION log_post_create()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
BEGIN
  -- RLS 우회: SECURITY DEFINER 함수 내에서 RLS를 비활성화하여
  -- 트리거 실행 시 posts 테이블의 RLS 정책으로 인한 오류 방지
  SET LOCAL row_security = off;
  
  -- 게시판 정보 가져오기
  SELECT name, code INTO board_name_val, board_code_val
  FROM boards
  WHERE id = NEW.board_id;
  
  -- 게시판 정보가 없는 경우 처리
  IF board_name_val IS NULL THEN
    board_name_val := '알 수 없음';
    board_code_val := 'unknown';
  END IF;
  
  -- 작성자 정보
  user_id_val := NEW.author_id;
  user_name_val := COALESCE(NEW.author_name, '익명');
  
  -- 활동 로그 생성
  INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
  VALUES (
    user_id_val,
    user_name_val,
    'POST_CREATE',
    '게시글 작성',
    board_name_val || ' 게시글 작성 완료',
    jsonb_build_object(
      'boardName', board_name_val,
      'boardCode', board_code_val,
      'postId', NEW.id,
      'postTitle', NEW.title
    ),
    CASE 
      WHEN NEW.author_ip IS NOT NULL AND NEW.author_ip != '' 
      THEN NEW.author_ip::inet 
      ELSE NULL 
    END
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

CREATE OR REPLACE FUNCTION log_post_update()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
  changed_fields TEXT[];
BEGIN
  -- RLS 우회: SECURITY DEFINER 함수 내에서 RLS를 비활성화하여
  -- 트리거 실행 시 posts 테이블의 RLS 정책으로 인한 오류 방지
  SET LOCAL row_security = off;
  
  -- 게시판 정보 가져오기
  SELECT name, code INTO board_name_val, board_code_val
  FROM boards
  WHERE id = NEW.board_id;
  
  -- 게시판 정보가 없는 경우 처리
  IF board_name_val IS NULL THEN
    board_name_val := '알 수 없음';
    board_code_val := 'unknown';
  END IF;
  
  -- 현재 사용자 정보 가져오기
  user_id_val := auth.uid();
  
  IF user_id_val IS NOT NULL THEN
    SELECT name INTO user_name_val
    FROM profiles
    WHERE id = user_id_val;
    
    IF user_name_val IS NULL OR user_name_val = '' THEN
      user_name_val := COALESCE(NEW.author_name, '익명');
    END IF;
  ELSE
    user_name_val := COALESCE(NEW.author_name, '익명');
  END IF;
  
  -- 변경된 필드 확인
  changed_fields := ARRAY[]::TEXT[];
  
  IF OLD.title IS DISTINCT FROM NEW.title THEN
    changed_fields := array_append(changed_fields, 'title');
  END IF;
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    changed_fields := array_append(changed_fields, 'content');
  END IF;
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    changed_fields := array_append(changed_fields, 'status');
  END IF;
  IF OLD.is_pinned IS DISTINCT FROM NEW.is_pinned THEN
    changed_fields := array_append(changed_fields, 'is_pinned');
  END IF;
  IF OLD.is_secret IS DISTINCT FROM NEW.is_secret THEN
    changed_fields := array_append(changed_fields, 'is_secret');
  END IF;
  IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
    changed_fields := array_append(changed_fields, 'category_id');
  END IF;
  IF OLD.thumbnail_url IS DISTINCT FROM NEW.thumbnail_url THEN
    changed_fields := array_append(changed_fields, 'thumbnail_url');
  END IF;
  
  -- 변경사항이 있는 경우에만 로그 기록
  IF array_length(changed_fields, 1) > 0 THEN
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
    VALUES (
      user_id_val,
      user_name_val,
      'POST_UPDATE',
      '게시글 수정',
      board_name_val || ' 게시글 수정',
      jsonb_build_object(
        'boardName', board_name_val,
        'boardCode', board_code_val,
        'postId', NEW.id,
        'postTitle', NEW.title,
        'changedFields', changed_fields
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
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

CREATE OR REPLACE FUNCTION log_post_delete()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
BEGIN
  -- RLS 우회: SECURITY DEFINER 함수 내에서 RLS를 비활성화하여
  -- 트리거 실행 시 posts 테이블의 RLS 정책으로 인한 오류 방지
  SET LOCAL row_security = off;
  
  -- soft delete인 경우 (deleted_at이 설정된 경우)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- 게시판 정보 가져오기
    SELECT name, code INTO board_name_val, board_code_val
    FROM boards
    WHERE id = OLD.board_id;
    
    -- 게시판 정보가 없는 경우 처리
    IF board_name_val IS NULL THEN
      board_name_val := '알 수 없음';
      board_code_val := 'unknown';
    END IF;
    
    -- 현재 사용자 정보 가져오기
    user_id_val := auth.uid();
    
    IF user_id_val IS NOT NULL THEN
      SELECT name INTO user_name_val
      FROM profiles
      WHERE id = user_id_val;
      
      IF user_name_val IS NULL OR user_name_val = '' THEN
        user_name_val := COALESCE(OLD.author_name, '익명');
      END IF;
    ELSE
      user_name_val := COALESCE(OLD.author_name, '익명');
    END IF;
    
    -- 활동 로그 생성
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
    VALUES (
      user_id_val,
      user_name_val,
      'POST_DELETE',
      '게시글 삭제',
      board_name_val || ' 게시글 삭제',
      jsonb_build_object(
        'boardName', board_name_val,
        'boardCode', board_code_val,
        'postId', OLD.id,
        'postTitle', OLD.title
      ),
      CASE 
        WHEN OLD.author_ip IS NOT NULL AND OLD.author_ip != '' 
        THEN OLD.author_ip::inet 
        ELSE NULL 
      END
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 게시글 트리거 생성
DROP TRIGGER IF EXISTS on_post_create ON posts;
CREATE TRIGGER on_post_create
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION log_post_create();

DROP TRIGGER IF EXISTS on_post_update ON posts;
CREATE TRIGGER on_post_update
  AFTER UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION log_post_update();

DROP TRIGGER IF EXISTS on_post_delete ON posts;
CREATE TRIGGER on_post_delete
  AFTER UPDATE ON posts
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION log_post_delete();

-- 6-5. 관리자 답변 로그 트리거
CREATE OR REPLACE FUNCTION log_post_answer()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
  is_admin_user BOOLEAN;
BEGIN
  -- RLS 우회: SECURITY DEFINER 함수 내에서 RLS를 비활성화하여
  -- 트리거 실행 시 posts 테이블의 RLS 정책으로 인한 오류 방지
  SET LOCAL row_security = off;
  
  -- 작성자가 관리자인지 확인
  user_id_val := NEW.author_id;
  
  IF user_id_val IS NOT NULL THEN
    -- 관리자 여부 확인
    SELECT EXISTS (
      SELECT 1 FROM administrators
      WHERE id = user_id_val
      AND deleted_at IS NULL
    ) INTO is_admin_user;
    
    -- 관리자인 경우에만 로그 기록
    IF is_admin_user THEN
      -- 게시판 정보 가져오기
      SELECT b.name, b.code INTO board_name_val, board_code_val
      FROM posts p
      JOIN boards b ON p.board_id = b.id
      WHERE p.id = NEW.post_id;
      
      -- Q&A 또는 견적문의 게시판인 경우만 로그 기록
      IF board_code_val IN ('qna', 'quotes') THEN
        -- 작성자 이름 가져오기
        SELECT name INTO user_name_val
        FROM profiles
        WHERE id = user_id_val;
        
        IF user_name_val IS NULL OR user_name_val = '' THEN
          user_name_val := COALESCE(NEW.author_name, '관리자');
        END IF;
        
        -- 활동 로그 생성
        INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
        VALUES (
          user_id_val,
          user_name_val,
          'POST_ANSWER',
          '관리자 답변',
          board_name_val || ' 게시글에 답변 작성',
          jsonb_build_object(
            'boardName', board_name_val,
            'postId', NEW.post_id
          ),
          CASE 
            WHEN NEW.author_ip IS NOT NULL AND NEW.author_ip != '' 
            THEN NEW.author_ip::inet 
            ELSE NULL 
          END
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 관리자 답변 트리거 생성
DROP TRIGGER IF EXISTS on_post_answer ON comments;
CREATE TRIGGER on_post_answer
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION log_post_answer();

-- 6-6. pages 테이블 변경 로그 트리거
CREATE OR REPLACE FUNCTION log_page_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  changed_fields TEXT[];
BEGIN
  -- 현재 사용자 정보 가져오기
  user_id_val := auth.uid();
  
  IF user_id_val IS NOT NULL THEN
    BEGIN
      SELECT name INTO user_name_val
      FROM profiles
      WHERE id = user_id_val;
      
      IF user_name_val IS NULL OR user_name_val = '' THEN
        user_name_val := '알 수 없음';
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        user_name_val := '알 수 없음';
    END;
  ELSE
    user_name_val := '시스템';
  END IF;
  
  -- 변경된 필드 확인
  changed_fields := ARRAY[]::TEXT[];
  
  IF OLD.code IS DISTINCT FROM NEW.code THEN
    changed_fields := array_append(changed_fields, 'code');
  END IF;
  IF OLD.page IS DISTINCT FROM NEW.page THEN
    changed_fields := array_append(changed_fields, 'page');
  END IF;
  IF OLD.section_type IS DISTINCT FROM NEW.section_type THEN
    changed_fields := array_append(changed_fields, 'section_type');
  END IF;
  IF OLD.display_order IS DISTINCT FROM NEW.display_order THEN
    changed_fields := array_append(changed_fields, 'display_order');
  END IF;
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    changed_fields := array_append(changed_fields, 'status');
  END IF;
  -- JSONB 필드 변경 감지
  IF (OLD.metadata IS NULL AND NEW.metadata IS NOT NULL) OR 
     (OLD.metadata IS NOT NULL AND NEW.metadata IS NULL) OR
     (OLD.metadata IS NOT NULL AND NEW.metadata IS NOT NULL AND OLD.metadata::text != NEW.metadata::text) THEN
    changed_fields := array_append(changed_fields, 'metadata');
  END IF;
  
  -- 변경사항이 있는 경우에만 로그 기록
  IF array_length(changed_fields, 1) > 0 THEN
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
    VALUES (
      user_id_val,
      user_name_val,
      'SECTION_SETTING_CHANGE',
      '섹션 설정 변경',
      NEW.page || ' 페이지의 ' || NEW.code || ' 섹션 변경',
      jsonb_build_object(
        'page', NEW.page,
        'code', NEW.code,
        'sectionType', NEW.section_type,
        'changedFields', changed_fields
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- pages 테이블 변경 트리거 생성
DROP TRIGGER IF EXISTS on_page_change ON pages;
CREATE TRIGGER on_page_change
  AFTER UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION log_page_change();

CREATE OR REPLACE FUNCTION log_page_create()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
BEGIN
  -- 현재 사용자 정보 가져오기
  user_id_val := auth.uid();
  
  IF user_id_val IS NOT NULL THEN
    BEGIN
      SELECT name INTO user_name_val
      FROM profiles
      WHERE id = user_id_val;
      
      IF user_name_val IS NULL OR user_name_val = '' THEN
        user_name_val := '알 수 없음';
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        user_name_val := '알 수 없음';
    END;
  ELSE
    user_name_val := '시스템';
  END IF;
  
  -- 활동 로그 생성
  INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
  VALUES (
    user_id_val,
    user_name_val,
    'SECTION_SETTING_CHANGE',
    '섹션 설정 변경',
    NEW.page || ' 페이지에 ' || NEW.code || ' 섹션 추가',
    jsonb_build_object(
      'page', NEW.page,
      'code', NEW.code,
      'sectionType', NEW.section_type
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

DROP TRIGGER IF EXISTS on_page_create ON pages;
CREATE TRIGGER on_page_create
  AFTER INSERT ON pages
  FOR EACH ROW EXECUTE FUNCTION log_page_create();

-- 6-7. site_settings 설정 변경 로그 트리거 (prologue 관련 제거됨)

CREATE OR REPLACE FUNCTION log_site_settings_contact_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  changed_fields TEXT[];
BEGIN
  -- 현재 사용자 정보 가져오기
  user_id_val := auth.uid();
  
  IF user_id_val IS NOT NULL THEN
    BEGIN
      SELECT name INTO user_name_val
      FROM profiles
      WHERE id = user_id_val;
      
      IF user_name_val IS NULL OR user_name_val = '' THEN
        user_name_val := '알 수 없음';
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        user_name_val := '알 수 없음';
    END;
  ELSE
    user_name_val := '시스템';
  END IF;
  
  -- 변경된 필드 확인 (연락처 관련 필드만)
  changed_fields := ARRAY[]::TEXT[];
  
  IF (OLD.contact_email IS NULL AND NEW.contact_email IS NOT NULL) OR 
     (OLD.contact_email IS NOT NULL AND NEW.contact_email IS NULL) OR
     (OLD.contact_email IS NOT NULL AND NEW.contact_email IS NOT NULL AND OLD.contact_email != NEW.contact_email) THEN
    changed_fields := array_append(changed_fields, 'contact_email');
  END IF;
  IF (OLD.contact_address IS NULL AND NEW.contact_address IS NOT NULL) OR 
     (OLD.contact_address IS NOT NULL AND NEW.contact_address IS NULL) OR
     (OLD.contact_address IS NOT NULL AND NEW.contact_address IS NOT NULL AND OLD.contact_address != NEW.contact_address) THEN
    changed_fields := array_append(changed_fields, 'contact_address');
  END IF;
  IF (OLD.contact_business_hours IS NULL AND NEW.contact_business_hours IS NOT NULL) OR 
     (OLD.contact_business_hours IS NOT NULL AND NEW.contact_business_hours IS NULL) OR
     (OLD.contact_business_hours IS NOT NULL AND NEW.contact_business_hours IS NOT NULL AND OLD.contact_business_hours != NEW.contact_business_hours) THEN
    changed_fields := array_append(changed_fields, 'contact_business_hours');
  END IF;
  IF (OLD.contact_phone_primary IS NULL AND NEW.contact_phone_primary IS NOT NULL) OR 
     (OLD.contact_phone_primary IS NOT NULL AND NEW.contact_phone_primary IS NULL) OR
     (OLD.contact_phone_primary IS NOT NULL AND NEW.contact_phone_primary IS NOT NULL AND OLD.contact_phone_primary != NEW.contact_phone_primary) THEN
    changed_fields := array_append(changed_fields, 'contact_phone_primary');
  END IF;
  IF (OLD.contact_phone_secondary IS NULL AND NEW.contact_phone_secondary IS NOT NULL) OR 
     (OLD.contact_phone_secondary IS NOT NULL AND NEW.contact_phone_secondary IS NULL) OR
     (OLD.contact_phone_secondary IS NOT NULL AND NEW.contact_phone_secondary IS NOT NULL AND OLD.contact_phone_secondary != NEW.contact_phone_secondary) THEN
    changed_fields := array_append(changed_fields, 'contact_phone_secondary');
  END IF;
  IF (OLD.contact_fax IS NULL AND NEW.contact_fax IS NOT NULL) OR 
     (OLD.contact_fax IS NOT NULL AND NEW.contact_fax IS NULL) OR
     (OLD.contact_fax IS NOT NULL AND NEW.contact_fax IS NOT NULL AND OLD.contact_fax != NEW.contact_fax) THEN
    changed_fields := array_append(changed_fields, 'contact_fax');
  END IF;
  IF (OLD.contact_map_url IS NULL AND NEW.contact_map_url IS NOT NULL) OR 
     (OLD.contact_map_url IS NOT NULL AND NEW.contact_map_url IS NULL) OR
     (OLD.contact_map_url IS NOT NULL AND NEW.contact_map_url IS NOT NULL AND OLD.contact_map_url != NEW.contact_map_url) THEN
    changed_fields := array_append(changed_fields, 'contact_map_url');
  END IF;
  IF (OLD.contact_extra_json IS NULL AND NEW.contact_extra_json IS NOT NULL) OR 
     (OLD.contact_extra_json IS NOT NULL AND NEW.contact_extra_json IS NULL) OR
     (OLD.contact_extra_json IS NOT NULL AND NEW.contact_extra_json IS NOT NULL AND OLD.contact_extra_json != NEW.contact_extra_json) THEN
    changed_fields := array_append(changed_fields, 'contact_extra_json');
  END IF;
  
  -- 변경사항이 있는 경우에만 로그 기록
  IF array_length(changed_fields, 1) > 0 THEN
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
    VALUES (
      user_id_val,
      user_name_val,
      'SECTION_SETTING_CHANGE',
      '섹션 설정 변경',
      '연락처 정보 설정 변경',
      jsonb_build_object(
        'sectionName', '연락처 정보',
        'changedFields', changed_fields
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

CREATE OR REPLACE FUNCTION log_site_settings_board_connection_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  changed_fields TEXT[];
  old_board_name TEXT;
  new_board_name TEXT;
BEGIN
  -- 현재 사용자 정보 가져오기
  user_id_val := auth.uid();
  
  IF user_id_val IS NOT NULL THEN
    BEGIN
      SELECT name INTO user_name_val
      FROM profiles
      WHERE id = user_id_val;
      
      IF user_name_val IS NULL OR user_name_val = '' THEN
        user_name_val := '알 수 없음';
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        user_name_val := '알 수 없음';
    END;
  ELSE
    user_name_val := '시스템';
  END IF;
  
  -- 변경된 필드 확인 (게시판 연결 관련 필드만)
  changed_fields := ARRAY[]::TEXT[];
  
  -- notice_board_id 변경 감지
  IF OLD.notice_board_id IS DISTINCT FROM NEW.notice_board_id THEN
    changed_fields := array_append(changed_fields, 'notice_board_id');
    
    -- 게시판 이름 가져오기 (메타데이터에 포함)
    IF OLD.notice_board_id IS NOT NULL THEN
      SELECT name INTO old_board_name FROM boards WHERE id = OLD.notice_board_id;
    END IF;
    IF NEW.notice_board_id IS NOT NULL THEN
      SELECT name INTO new_board_name FROM boards WHERE id = NEW.notice_board_id;
    END IF;
  END IF;
  
  -- inquire_board_id 변경 감지
  IF OLD.inquire_board_id IS DISTINCT FROM NEW.inquire_board_id THEN
    changed_fields := array_append(changed_fields, 'inquire_board_id');
  END IF;
  
  -- pds_board_id 변경 감지
  IF OLD.pds_board_id IS DISTINCT FROM NEW.pds_board_id THEN
    changed_fields := array_append(changed_fields, 'pds_board_id');
  END IF;
  
  -- 변경사항이 있는 경우에만 로그 기록
  IF array_length(changed_fields, 1) > 0 THEN
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
    VALUES (
      user_id_val,
      user_name_val,
      'SECTION_SETTING_CHANGE',
      '섹션 설정 변경',
      '게시판 연결 설정 변경',
      jsonb_build_object(
        'sectionName', '게시판 연결',
        'changedFields', changed_fields,
        'oldNoticeBoardName', old_board_name,
        'newNoticeBoardName', new_board_name
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- site_settings 트리거 생성
DROP TRIGGER IF EXISTS on_site_settings_contact_change ON site_settings;
CREATE TRIGGER on_site_settings_contact_change
  AFTER UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION log_site_settings_contact_change();

DROP TRIGGER IF EXISTS on_site_settings_board_connection_change ON site_settings;
CREATE TRIGGER on_site_settings_board_connection_change
  AFTER UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION log_site_settings_board_connection_change();

-- ============================================================================
-- 7. 댓글 작성/수정/삭제 로그 트리거 함수들
-- ============================================================================

-- 7-1. 댓글 작성 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 7-2. 댓글 수정 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 7-3. 댓글 삭제 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 댓글 트리거 생성
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


