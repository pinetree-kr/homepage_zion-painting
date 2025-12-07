-- ============================================================================
-- 마이그레이션: 트리거 함수에 search_path 설정 추가
-- ============================================================================
-- 
-- 문제: SECURITY DEFINER 함수들이 search_path를 명시하지 않아
--       RLS 정책이 제대로 작동하지 않거나 잘못된 스키마에서 테이블을 찾을 수 있음
-- 
-- 해결: 모든 SECURITY DEFINER 함수에 SET search_path = public 추가
-- ============================================================================

-- 1. 사용자 가입 시 프로필 자동 생성 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. 사용자 가입 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 관리자 가입 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. 게시판 생성 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. 게시판 삭제 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. 게시글 작성 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. 게시글 수정 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. 게시글 삭제 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. 관리자 답변 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. 페이지 변경 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. 페이지 생성 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. 연락처 설정 변경 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 13. 게시판 연결 설정 변경 로그 트리거 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
