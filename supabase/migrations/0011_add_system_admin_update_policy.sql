-- ============================================================================
-- system 롤을 가진 관리자가 다른 관리자를 수정할 수 있는 권한 부여
-- ============================================================================

-- system 롤을 가진 관리자인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_system_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM administrators 
    WHERE administrators.id = user_id
    AND administrators.role = 'system'
    AND administrators.deleted_at IS NULL
  );
$$;

-- system 롤을 가진 관리자가 다른 관리자를 수정할 수 있는 정책
CREATE POLICY "System admins can update administrators" ON administrators
  FOR UPDATE 
  USING (
    is_system_admin(auth.uid())
  )
  WITH CHECK (
    is_system_admin(auth.uid())
  );