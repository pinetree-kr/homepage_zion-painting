-- ============================================================================
-- 활동 로그 자동 생성 트리거
-- ============================================================================
-- 
-- 주의사항:
-- - 데이터베이스 트리거는 HTTP 요청의 IP 주소나 User-Agent에 직접 접근할 수 없습니다.
-- - IP 주소가 필요한 경우, 애플리케이션 코드에서 직접 로그를 기록해야 합니다.
-- - 트리거는 자동화된 로깅을 위해 사용되며, IP 주소는 NULL로 기록됩니다.
-- - IP 주소가 필요한 로그(예: 로그인 실패, 관리자 로그인)는 애플리케이션 코드에서 처리해야합니다.
-- ============================================================================

-- ============================================================================
-- 1. 사용자 가입 로그 트리거
-- ============================================================================

-- 사용자 가입 시 자동 로그 생성 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 가입 트리거 생성
DROP TRIGGER IF EXISTS on_user_signup ON auth.users;
CREATE TRIGGER on_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION log_user_signup();

-- ============================================================================
-- 2. 관리자 가입 로그 트리거
-- ============================================================================

-- 관리자 가입 시 자동 로그 생성 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 관리자 가입 트리거 생성
DROP TRIGGER IF EXISTS on_admin_signup ON administrators;
CREATE TRIGGER on_admin_signup
  AFTER INSERT ON administrators
  FOR EACH ROW EXECUTE FUNCTION log_admin_signup();

-- ============================================================================
-- 3. 게시판 생성/수정/삭제 로그 트리거
-- ============================================================================

-- 게시판 생성 로그 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 게시판 수정 로그 함수
-- 주의: 애플리케이션 코드에서 게시판 정보 변경과 권한 변경을 구분하여 로그를 기록하므로,
-- 트리거는 비활성화합니다. 애플리케이션 코드에서 더 정확한 로그를 기록할 수 있습니다.
-- CREATE OR REPLACE FUNCTION log_board_update()
-- RETURNS TRIGGER AS $$
-- DECLARE
--   user_id_val UUID;
--   user_name_val VARCHAR(255);
-- BEGIN
--   -- 현재 사용자 정보 가져오기
--   user_id_val := auth.uid();
--   
--   IF user_id_val IS NOT NULL THEN
--     SELECT name INTO user_name_val
--     FROM profiles
--     WHERE id = user_id_val;
--     
--     IF user_name_val IS NULL OR user_name_val = '' THEN
--       user_name_val := '알 수 없음';
--     END IF;
--   ELSE
--     user_name_val := '시스템';
--   END IF;
--   
--   -- 활동 로그 생성
--   INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
--   VALUES (
--     user_id_val,
--     user_name_val,
--     'BOARD_UPDATE',
--     '게시판 수정',
--     '게시판 설정 수정: ' || NEW.name,
--     jsonb_build_object('boardName', NEW.name)
--   );
--   
--   RETURN NEW;
-- EXCEPTION
--   WHEN OTHERS THEN
--     RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 게시판 삭제 로그 함수 (soft delete 포함)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 게시판 트리거 생성
DROP TRIGGER IF EXISTS on_board_create ON boards;
CREATE TRIGGER on_board_create
  AFTER INSERT ON boards
  FOR EACH ROW EXECUTE FUNCTION log_board_create();

-- 게시판 수정 트리거는 비활성화 (애플리케이션 코드에서 게시판 정보 변경과 권한 변경을 구분하여 로그 기록)
-- DROP TRIGGER IF EXISTS on_board_update ON boards;
-- CREATE TRIGGER on_board_update
--   AFTER UPDATE ON boards
--   FOR EACH ROW EXECUTE FUNCTION log_board_update();

DROP TRIGGER IF EXISTS on_board_delete ON boards;
CREATE TRIGGER on_board_delete
  AFTER UPDATE ON boards
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION log_board_delete();

-- ============================================================================
-- 4. 게시글 작성 로그 트리거 (Q&A, 견적문의만)
-- ============================================================================

-- 게시글 작성 로그 함수
CREATE OR REPLACE FUNCTION log_post_create()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
BEGIN
  -- 게시판 정보 가져오기
  SELECT name, code INTO board_name_val, board_code_val
  FROM boards
  WHERE id = NEW.board_id;
  
  -- Q&A 또는 견적문의 게시판인 경우만 로그 기록
  IF board_code_val IN ('qna', 'quotes') THEN
    -- 작성자 정보
    user_id_val := NEW.author_id;
    user_name_val := COALESCE(NEW.author_name, '익명');
    
    -- 활동 로그 생성
    -- 주의: 트리거에서는 IP 주소에 직접 접근할 수 없으므로, 
    -- posts 테이블에 저장된 author_ip를 사용합니다 (있는 경우에만)
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
    VALUES (
      user_id_val,
      user_name_val,
      'POST_CREATE',
      '게시글 작성',
      board_name_val || ' 게시글 작성 완료',
      jsonb_build_object(
        'boardName', board_name_val,
        'postId', NEW.id
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 게시글 작성 트리거 생성
DROP TRIGGER IF EXISTS on_post_create ON posts;
CREATE TRIGGER on_post_create
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION log_post_create();

-- ============================================================================
-- 5. 관리자 답변 로그 트리거 (댓글 작성 시 관리자인 경우)
-- ============================================================================

-- 관리자 답변 로그 함수
CREATE OR REPLACE FUNCTION log_post_answer()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  board_name_val VARCHAR(255);
  board_code_val VARCHAR(80);
  is_admin_user BOOLEAN;
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 관리자 답변 트리거 생성
DROP TRIGGER IF EXISTS on_post_answer ON comments;
CREATE TRIGGER on_post_answer
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION log_post_answer();

-- ============================================================================
-- 6. 섹션 설정 변경 로그 트리거
-- ============================================================================

-- 회사정보 설정 변경 로그 함수
CREATE OR REPLACE FUNCTION log_company_info_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  changed_fields TEXT[];
BEGIN
  -- 현재 사용자 정보 가져오기
  -- 서버 사이드에서 실행될 수 있으므로 auth.uid()가 NULL일 수 있음
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
  
  -- 변경된 필드 확인 (모든 필드 포함)
  changed_fields := ARRAY[]::TEXT[];
  
  IF (OLD.introduction IS NULL AND NEW.introduction IS NOT NULL) OR 
     (OLD.introduction IS NOT NULL AND NEW.introduction IS NULL) OR
     (OLD.introduction IS NOT NULL AND NEW.introduction IS NOT NULL AND OLD.introduction != NEW.introduction) THEN
    changed_fields := array_append(changed_fields, 'introduction');
  END IF;
  IF (OLD.vision IS NULL AND NEW.vision IS NOT NULL) OR 
     (OLD.vision IS NOT NULL AND NEW.vision IS NULL) OR
     (OLD.vision IS NOT NULL AND NEW.vision IS NOT NULL AND OLD.vision != NEW.vision) THEN
    changed_fields := array_append(changed_fields, 'vision');
  END IF;
  IF (OLD.greetings IS NULL AND NEW.greetings IS NOT NULL) OR 
     (OLD.greetings IS NOT NULL AND NEW.greetings IS NULL) OR
     (OLD.greetings IS NOT NULL AND NEW.greetings IS NOT NULL AND OLD.greetings != NEW.greetings) THEN
    changed_fields := array_append(changed_fields, 'greetings');
  END IF;
  IF (OLD.mission IS NULL AND NEW.mission IS NOT NULL) OR 
     (OLD.mission IS NOT NULL AND NEW.mission IS NULL) OR
     (OLD.mission IS NOT NULL AND NEW.mission IS NOT NULL AND OLD.mission != NEW.mission) THEN
    changed_fields := array_append(changed_fields, 'mission');
  END IF;
  -- JSONB 필드 변경 감지 (더 정확한 비교)
  IF (OLD.strengths IS NULL AND NEW.strengths IS NOT NULL) OR 
     (OLD.strengths IS NOT NULL AND NEW.strengths IS NULL) OR
     (OLD.strengths IS NOT NULL AND NEW.strengths IS NOT NULL AND OLD.strengths::text != NEW.strengths::text) THEN
    changed_fields := array_append(changed_fields, 'strengths');
  END IF;
  IF (OLD.values IS NULL AND NEW.values IS NOT NULL) OR 
     (OLD.values IS NOT NULL AND NEW.values IS NULL) OR
     (OLD.values IS NOT NULL AND NEW.values IS NOT NULL AND OLD.values::text != NEW.values::text) THEN
    changed_fields := array_append(changed_fields, 'values');
  END IF;
  IF (OLD.histories IS NULL AND NEW.histories IS NOT NULL) OR 
     (OLD.histories IS NOT NULL AND NEW.histories IS NULL) OR
     (OLD.histories IS NOT NULL AND NEW.histories IS NOT NULL AND OLD.histories::text != NEW.histories::text) THEN
    changed_fields := array_append(changed_fields, 'histories');
  END IF;
  IF (OLD.organization_members IS NULL AND NEW.organization_members IS NOT NULL) OR 
     (OLD.organization_members IS NOT NULL AND NEW.organization_members IS NULL) OR
     (OLD.organization_members IS NOT NULL AND NEW.organization_members IS NOT NULL AND OLD.organization_members::text != NEW.organization_members::text) THEN
    changed_fields := array_append(changed_fields, 'organization_members');
  END IF;
  
  -- 변경사항이 있는 경우에만 로그 기록
  -- updated_at 변경만 있는 경우는 제외 (트리거에 의한 자동 업데이트)
  IF array_length(changed_fields, 1) > 0 THEN
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
    VALUES (
      user_id_val,
      user_name_val,
      'SECTION_SETTING_CHANGE',
      '섹션 설정 변경',
      '회사정보 섹션 설정 변경',
      jsonb_build_object(
        'sectionName', '회사정보',
        'changedFields', changed_fields
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 로그 생성 실패해도 업데이트는 계속 진행
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사업정보 설정 변경 로그 함수
CREATE OR REPLACE FUNCTION log_business_info_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  changed_fields TEXT[];
BEGIN
  -- 현재 사용자 정보 가져오기
  -- 서버 사이드에서 실행될 수 있으므로 auth.uid()가 NULL일 수 있음
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
  
  IF OLD.introduction IS DISTINCT FROM NEW.introduction THEN
    changed_fields := array_append(changed_fields, 'introduction');
  END IF;
  -- JSONB 필드 변경 감지 (더 정확한 비교)
  IF (OLD.areas IS NULL AND NEW.areas IS NOT NULL) OR 
     (OLD.areas IS NOT NULL AND NEW.areas IS NULL) OR
     (OLD.areas IS NOT NULL AND NEW.areas IS NOT NULL AND OLD.areas::text != NEW.areas::text) THEN
    changed_fields := array_append(changed_fields, 'areas');
  END IF;
  
  -- 변경사항이 있는 경우에만 로그 기록
  -- updated_at 변경만 있는 경우는 제외 (트리거에 의한 자동 업데이트)
  IF array_length(changed_fields, 1) > 0 THEN
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
    VALUES (
      user_id_val,
      user_name_val,
      'SECTION_SETTING_CHANGE',
      '섹션 설정 변경',
      '사업정보 섹션 설정 변경',
      jsonb_build_object(
        'sectionName', '사업정보',
        'changedFields', changed_fields
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 로그 생성 실패해도 업데이트는 계속 진행
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 제품정보 설정 변경 로그 함수
CREATE OR REPLACE FUNCTION log_product_info_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  changed_fields TEXT[];
BEGIN
  -- 현재 사용자 정보 가져오기
  -- 서버 사이드에서 실행될 수 있으므로 auth.uid()가 NULL일 수 있음
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
  
  IF OLD.introduction IS DISTINCT FROM NEW.introduction THEN
    changed_fields := array_append(changed_fields, 'introduction');
  END IF;
  IF OLD.review_board_id IS DISTINCT FROM NEW.review_board_id THEN
    changed_fields := array_append(changed_fields, 'review_board_id');
  END IF;
  IF OLD.quote_board_id IS DISTINCT FROM NEW.quote_board_id THEN
    changed_fields := array_append(changed_fields, 'quote_board_id');
  END IF;
  
  -- 변경사항이 있는 경우에만 로그 기록
  -- updated_at 변경만 있는 경우는 제외 (트리거에 의한 자동 업데이트)
  IF array_length(changed_fields, 1) > 0 THEN
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
    VALUES (
      user_id_val,
      user_name_val,
      'SECTION_SETTING_CHANGE',
      '섹션 설정 변경',
      '제품정보 섹션 설정 변경',
      jsonb_build_object(
        'sectionName', '제품정보',
        'changedFields', changed_fields
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 로그 생성 실패해도 업데이트는 계속 진행
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 섹션 설정 변경 트리거 생성
DROP TRIGGER IF EXISTS on_company_info_change ON company_info;
CREATE TRIGGER on_company_info_change
  AFTER UPDATE ON company_info
  FOR EACH ROW EXECUTE FUNCTION log_company_info_change();

DROP TRIGGER IF EXISTS on_business_info_change ON business_info;
CREATE TRIGGER on_business_info_change
  AFTER UPDATE ON business_info
  FOR EACH ROW EXECUTE FUNCTION log_business_info_change();

DROP TRIGGER IF EXISTS on_product_info_change ON product_info;
CREATE TRIGGER on_product_info_change
  AFTER UPDATE ON product_info
  FOR EACH ROW EXECUTE FUNCTION log_product_info_change();

-- ============================================================================
-- 7. site_settings 캐러셀 설정 변경 로그 트리거
-- ============================================================================

-- site_settings 캐러셀 설정 변경 로그 함수
CREATE OR REPLACE FUNCTION log_site_settings_carousel_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  changed_fields TEXT[];
BEGIN
  -- 현재 사용자 정보 가져오기
  -- 서버 사이드에서 실행될 수 있으므로 auth.uid()가 NULL일 수 있음
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
  
  -- 변경된 필드 확인 (캐러셀 관련 필드만)
  changed_fields := ARRAY[]::TEXT[];
  
  IF (OLD.prologue_default_title IS NULL AND NEW.prologue_default_title IS NOT NULL) OR 
     (OLD.prologue_default_title IS NOT NULL AND NEW.prologue_default_title IS NULL) OR
     (OLD.prologue_default_title IS NOT NULL AND NEW.prologue_default_title IS NOT NULL AND OLD.prologue_default_title != NEW.prologue_default_title) THEN
    changed_fields := array_append(changed_fields, 'prologue_default_title');
  END IF;
  IF (OLD.prologue_default_description IS NULL AND NEW.prologue_default_description IS NOT NULL) OR 
     (OLD.prologue_default_description IS NOT NULL AND NEW.prologue_default_description IS NULL) OR
     (OLD.prologue_default_description IS NOT NULL AND NEW.prologue_default_description IS NOT NULL AND OLD.prologue_default_description != NEW.prologue_default_description) THEN
    changed_fields := array_append(changed_fields, 'prologue_default_description');
  END IF;
  
  -- 변경사항이 있는 경우에만 로그 기록
  -- updated_at 변경만 있는 경우는 제외 (트리거에 의한 자동 업데이트)
  IF array_length(changed_fields, 1) > 0 THEN
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
    VALUES (
      user_id_val,
      user_name_val,
      'SECTION_SETTING_CHANGE',
      '섹션 설정 변경',
      '프롤로그 캐러셀 설정 변경',
      jsonb_build_object(
        'sectionName', '프롤로그 캐러셀',
        'changedFields', changed_fields
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 로그 생성 실패해도 업데이트는 계속 진행
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- site_settings 연락처 정보 변경 로그 함수
CREATE OR REPLACE FUNCTION log_site_settings_contact_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_name_val VARCHAR(255);
  changed_fields TEXT[];
BEGIN
  -- 현재 사용자 정보 가져오기
  -- 서버 사이드에서 실행될 수 있으므로 auth.uid()가 NULL일 수 있음
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
    -- 로그 생성 실패해도 업데이트는 계속 진행
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- site_settings 게시판 연결 변경 로그 함수
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
  -- 서버 사이드에서 실행될 수 있으므로 auth.uid()가 NULL일 수 있음
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
    -- 로그 생성 실패해도 업데이트는 계속 진행
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- site_settings 트리거 생성
DROP TRIGGER IF EXISTS on_site_settings_carousel_change ON site_settings;
CREATE TRIGGER on_site_settings_carousel_change
  AFTER UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION log_site_settings_carousel_change();

DROP TRIGGER IF EXISTS on_site_settings_contact_change ON site_settings;
CREATE TRIGGER on_site_settings_contact_change
  AFTER UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION log_site_settings_contact_change();

DROP TRIGGER IF EXISTS on_site_settings_board_connection_change ON site_settings;
CREATE TRIGGER on_site_settings_board_connection_change
  AFTER UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION log_site_settings_board_connection_change();

-- ============================================================================
-- 8. prologue_carousel_items 변경 로그 트리거
-- ============================================================================

-- 캐러셀 아이템 생성 로그 함수
CREATE OR REPLACE FUNCTION log_carousel_item_create()
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
    '프롤로그 캐러셀 아이템 추가',
    jsonb_build_object(
      'sectionName', '프롤로그 캐러셀',
      'itemId', NEW.id,
      'itemTitle', NEW.title
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 캐러셀 아이템 수정 로그 함수
CREATE OR REPLACE FUNCTION log_carousel_item_update()
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
  
  IF (OLD.image_url IS NULL AND NEW.image_url IS NOT NULL) OR 
     (OLD.image_url IS NOT NULL AND NEW.image_url IS NULL) OR
     (OLD.image_url IS NOT NULL AND NEW.image_url IS NOT NULL AND OLD.image_url != NEW.image_url) THEN
    changed_fields := array_append(changed_fields, 'image_url');
  END IF;
  IF (OLD.title IS NULL AND NEW.title IS NOT NULL) OR 
     (OLD.title IS NOT NULL AND NEW.title IS NULL) OR
     (OLD.title IS NOT NULL AND NEW.title IS NOT NULL AND OLD.title != NEW.title) THEN
    changed_fields := array_append(changed_fields, 'title');
  END IF;
  IF (OLD.description IS NULL AND NEW.description IS NOT NULL) OR 
     (OLD.description IS NOT NULL AND NEW.description IS NULL) OR
     (OLD.description IS NOT NULL AND NEW.description IS NOT NULL AND OLD.description != NEW.description) THEN
    changed_fields := array_append(changed_fields, 'description');
  END IF;
  IF OLD.display_order IS DISTINCT FROM NEW.display_order THEN
    changed_fields := array_append(changed_fields, 'display_order');
  END IF;
  
  -- 변경사항이 있는 경우에만 로그 기록
  IF array_length(changed_fields, 1) > 0 THEN
    INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
    VALUES (
      user_id_val,
      user_name_val,
      'SECTION_SETTING_CHANGE',
      '섹션 설정 변경',
      '프롤로그 캐러셀 아이템 수정',
      jsonb_build_object(
        'sectionName', '프롤로그 캐러셀',
        'itemId', NEW.id,
        'itemTitle', NEW.title,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 캐러셀 아이템 삭제 로그 함수
CREATE OR REPLACE FUNCTION log_carousel_item_delete()
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
    '프롤로그 캐러셀 아이템 삭제',
    jsonb_build_object(
      'sectionName', '프롤로그 캐러셀',
      'itemId', OLD.id,
      'itemTitle', OLD.title
    )
  );
  
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '활동 로그 생성 실패: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- prologue_carousel_items 트리거 생성
DROP TRIGGER IF EXISTS on_carousel_item_create ON prologue_carousel_items;
CREATE TRIGGER on_carousel_item_create
  AFTER INSERT ON prologue_carousel_items
  FOR EACH ROW EXECUTE FUNCTION log_carousel_item_create();

DROP TRIGGER IF EXISTS on_carousel_item_update ON prologue_carousel_items;
CREATE TRIGGER on_carousel_item_update
  AFTER UPDATE ON prologue_carousel_items
  FOR EACH ROW EXECUTE FUNCTION log_carousel_item_update();

DROP TRIGGER IF EXISTS on_carousel_item_delete ON prologue_carousel_items;
CREATE TRIGGER on_carousel_item_delete
  AFTER DELETE ON prologue_carousel_items
  FOR EACH ROW EXECUTE FUNCTION log_carousel_item_delete();

-- ============================================================================
-- 주석 추가
-- ============================================================================

COMMENT ON FUNCTION log_user_signup() IS '사용자 가입 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_admin_signup() IS '관리자 가입 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_board_create() IS '게시판 생성 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_board_update() IS '게시판 수정 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_board_delete() IS '게시판 삭제 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_post_create() IS '게시글 작성 시 자동으로 활동 로그를 생성하는 트리거 함수 (Q&A, 견적문의만)';
COMMENT ON FUNCTION log_post_answer() IS '관리자 답변 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_company_info_change() IS '회사정보 섹션 설정 변경 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_business_info_change() IS '사업정보 섹션 설정 변경 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_product_info_change() IS '제품정보 섹션 설정 변경 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_site_settings_carousel_change() IS 'site_settings의 프롤로그 캐러셀 설정 변경 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_site_settings_contact_change() IS 'site_settings의 연락처 정보 변경 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_site_settings_board_connection_change() IS 'site_settings의 게시판 연결 설정 변경 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_carousel_item_create() IS '프롤로그 캐러셀 아이템 생성 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_carousel_item_update() IS '프롤로그 캐러셀 아이템 수정 시 자동으로 활동 로그를 생성하는 트리거 함수';
COMMENT ON FUNCTION log_carousel_item_delete() IS '프롤로그 캐러셀 아이템 삭제 시 자동으로 활동 로그를 생성하는 트리거 함수';
