-- ============================================================================
-- 게시글 수정/삭제 로그 타입 추가 및 RLS 정책 개선
-- ============================================================================

-- 1. ENUM 타입에 POST_UPDATE, POST_DELETE 추가
-- 이미 존재하는 경우를 대비하여 IF NOT EXISTS 사용 불가 (ENUM은 지원하지 않음)
-- 따라서 DO 블록으로 처리
DO $$
BEGIN
  -- POST_UPDATE 추가
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'POST_UPDATE' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'log_type')
  ) THEN
    ALTER TYPE log_type ADD VALUE 'POST_UPDATE';
  END IF;
  
  -- POST_DELETE 추가
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'POST_DELETE' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'log_type')
  ) THEN
    ALTER TYPE log_type ADD VALUE 'POST_DELETE';
  END IF;
END $$;

-- ============================================================================
-- 2. 게시글 수정/삭제 RLS 정책 개선
-- 기존 20251201211115 마이그레이션의 RLS 정책을 기반으로 개선
-- ============================================================================

-- 기존 정책 삭제 (20251201211115에서 생성된 정책)
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;

-- 개선된 UPDATE 정책: 
-- - 기존 구조 유지 (auth.uid() = author_id OR is_admin(auth.uid()))
-- - deleted_at이 NULL인 경우에만 수정 가능 (이미 삭제된 게시글 수정 방지)
CREATE POLICY "Authors and admins can update posts" ON posts
  FOR UPDATE USING (
    -- 삭제되지 않은 게시글만 수정 가능
    deleted_at IS NULL
    AND (
      auth.uid() = author_id OR
      is_admin(auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() = author_id OR
    is_admin(auth.uid())
  );
