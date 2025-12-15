# 활동 로그 트리거 디버깅 가이드

## 현재 상태

✅ `activity_logs` 테이블은 존재합니다.  
⚠️ 로그가 없습니다 - 트리거가 작동하지 않거나 아직 적용되지 않았을 수 있습니다.

## 확인 방법

### 1. 마이그레이션 적용 확인

```bash
# 로컬 환경
npm run supabase:status

# 마이그레이션 재적용
npm run supabase:reset
```

### 2. Supabase Dashboard에서 확인

1. **Supabase Dashboard** 접속
2. **SQL Editor** 열기
3. 다음 쿼리 실행:

```sql
-- 트리거 목록 확인
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%log%' OR trigger_name LIKE '%activity%'
ORDER BY event_object_table, trigger_name;

-- 트리거 함수 확인
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name LIKE 'log_%'
ORDER BY routine_name;

-- 트리거 활성화 상태 확인
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname LIKE '%log%' OR tgname LIKE '%activity%'
ORDER BY tgname;
```

### 3. 트리거 테스트

Supabase Dashboard의 SQL Editor에서:

```sql
-- 1. 테스트 게시판 생성
INSERT INTO boards (code, name, description, is_public, allow_anonymous, allow_comment, allow_file, allow_guest, display_order)
VALUES ('test-trigger', '트리거 테스트', '테스트용', TRUE, FALSE, FALSE, FALSE, FALSE, 999)
RETURNING id;

-- 2. 로그 확인
SELECT * FROM activity_logs 
WHERE log_type = 'BOARD_CREATE' 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. 테스트 데이터 정리
DELETE FROM boards WHERE code = 'test-trigger';
```

### 4. 트리거 수동 실행 테스트

```sql
-- 트리거 함수 직접 호출 (주의: 실제 데이터에 영향을 줄 수 있음)
-- 이 방법은 테스트용으로만 사용하세요

-- 예: 게시판 생성 로그 함수 테스트
DO $$
DECLARE
  test_board_id UUID;
  test_user_id UUID;
BEGIN
  -- 테스트용 게시판 ID (실제 존재하는 ID 사용)
  SELECT id INTO test_board_id FROM boards LIMIT 1;
  
  -- 테스트용 사용자 ID (실제 존재하는 ID 사용)
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  -- 로그 생성 테스트
  INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata)
  VALUES (
    test_user_id,
    '테스트 사용자',
    'BOARD_CREATE',
    '게시판 생성',
    '테스트',
    jsonb_build_object('boardName', '테스트')
  );
  
  RAISE NOTICE '로그 생성 성공';
END $$;
```

## 문제 해결

### 트리거가 없는 경우

1. 마이그레이션 파일이 적용되었는지 확인
2. 마이그레이션 재적용:
   ```bash
   npm run supabase:reset
   ```

### 트리거가 있지만 작동하지 않는 경우

1. **트리거 활성화 확인**: `tgenabled`가 'O' (enabled)인지 확인
2. **RLS 정책 확인**: 트리거 함수는 `SECURITY DEFINER`로 설정되어 있어야 함
3. **오류 로그 확인**: PostgreSQL 로그에서 WARNING 메시지 확인

### 트리거 함수 오류 확인

```sql
-- 함수 정의 확인
SELECT 
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname LIKE 'log_%'
ORDER BY proname;

-- 함수 실행 권한 확인
SELECT 
  p.proname as function_name,
  p.prosecdef as is_security_definer
FROM pg_proc p
WHERE p.proname LIKE 'log_%'
ORDER BY p.proname;
```

## 자동 확인 스크립트

프로젝트 루트에서 실행:

```bash
# 트리거 상태 확인
node scripts/check-triggers.js

# 트리거 테스트 (Service Role Key 필요)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/test-trigger.js
```

## 다음 단계

1. ✅ 마이그레이션 적용 확인
2. ✅ 트리거 존재 확인
3. ✅ 트리거 활성화 확인
4. ✅ 실제 이벤트로 테스트 (게시판 생성, 사용자 가입 등)

