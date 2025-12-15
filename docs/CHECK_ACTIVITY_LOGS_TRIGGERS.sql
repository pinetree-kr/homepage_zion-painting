-- ============================================================================
-- 활동 로그 트리거 확인 및 디버깅 스크립트
-- ============================================================================

-- 1. 트리거 목록 확인
SELECT 
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%log%' OR trigger_name LIKE '%activity%'
ORDER BY event_object_table, trigger_name;

-- 2. 트리거 함수 목록 확인
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name LIKE 'log_%'
ORDER BY routine_name;

-- 3. activity_logs 테이블 존재 확인
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'activity_logs';

-- 4. activity_logs 테이블 구조 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'activity_logs'
ORDER BY ordinal_position;

-- 5. 최근 활동 로그 확인 (최근 10개)
SELECT 
  id,
  user_name,
  log_type,
  action,
  details,
  created_at
FROM activity_logs
ORDER BY created_at DESC
LIMIT 10;

-- 6. 로그 타입별 개수 확인
SELECT 
  log_type,
  COUNT(*) as count
FROM activity_logs
GROUP BY log_type
ORDER BY count DESC;

-- 7. 트리거가 제대로 작동하는지 테스트
-- (주의: 실제 데이터에 영향을 줄 수 있으므로 테스트 환경에서만 실행)

-- 7-1. 게시판 생성 테스트 (테스트용 게시판)
-- INSERT INTO boards (code, name, description, is_public, allow_anonymous, allow_comment, allow_file, allow_guest, display_order)
-- VALUES ('test-board', '테스트 게시판', '트리거 테스트용', TRUE, FALSE, FALSE, FALSE, FALSE, 999)
-- RETURNING id;

-- 7-2. 게시판 수정 테스트
-- UPDATE boards SET description = '트리거 테스트 수정' WHERE code = 'test-board';

-- 7-3. 게시판 삭제 테스트 (soft delete)
-- UPDATE boards SET deleted_at = NOW() WHERE code = 'test-board';

-- 7-4. 테스트 데이터 정리
-- DELETE FROM boards WHERE code = 'test-board';

-- 8. 트리거 함수 직접 테스트 (예: 게시판 생성)
-- SELECT log_board_create();

-- 9. RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'activity_logs';

-- 10. 트리거 실행 로그 확인 (PostgreSQL 로그에서 확인)
-- SHOW log_min_messages;
-- SHOW log_statement;

-- 11. 트리거 함수에 오류가 있는지 확인
-- 다음 쿼리로 함수 정의 확인
SELECT 
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname LIKE 'log_%'
ORDER BY proname;

-- 12. 트리거가 비활성화되어 있는지 확인
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname LIKE '%log%' OR tgname LIKE '%activity%'
ORDER BY tgname;

-- 13. 특정 테이블의 트리거 확인
-- 예: boards 테이블
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'boards'
ORDER BY trigger_name;

-- 14. 트리거 실행 순서 확인
-- PostgreSQL에서는 트리거 실행 순서를 보장하지 않지만,
-- 같은 이벤트에 여러 트리거가 있을 경우 이름 순서로 실행됩니다.
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_order
FROM information_schema.triggers
WHERE event_object_table IN ('auth.users', 'administrators', 'boards', 'posts', 'comments', 'company_info', 'business_info', 'product_info')
ORDER BY event_object_table, action_timing, trigger_name;

-- 15. 활동 로그 삽입 권한 확인
-- 현재 사용자가 activity_logs에 INSERT할 수 있는지 확인
SELECT 
  has_table_privilege('activity_logs', 'INSERT') as can_insert,
  has_table_privilege('activity_logs', 'SELECT') as can_select;

-- 16. 트리거 함수의 SECURITY DEFINER 확인
SELECT 
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE p.proname LIKE 'log_%'
ORDER BY p.proname;

