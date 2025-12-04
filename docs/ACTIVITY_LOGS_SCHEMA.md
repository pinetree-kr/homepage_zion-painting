# 활동 로그 스키마 문서

## 개요

시스템의 모든 활동과 오류를 기록하는 `activity_logs` 테이블의 스키마 및 사용 가이드입니다.

## 테이블 구조

### activity_logs

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 로그 고유 ID |
| user_id | UUID | FOREIGN KEY → auth.users(id) | 사용자 ID (NULL 가능) |
| user_name | VARCHAR(255) | NOT NULL | 사용자 이름 |
| log_type | log_type (ENUM) | NOT NULL | 로그 타입 |
| action | VARCHAR(255) | NOT NULL | 작업명 |
| details | TEXT | | 상세 설명 |
| metadata | JSONB | DEFAULT '{}' | 추가 메타데이터 |
| ip_address | INET | | IP 주소 |
| user_agent | TEXT | | User-Agent |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 시간 |

## 로그 타입 (log_type ENUM)

| 타입 | 설명 | 예시 |
|------|------|------|
| `USER_SIGNUP` | 사용자 가입 | 일반 사용자 회원가입 |
| `ADMIN_SIGNUP` | 관리자 가입 | 관리자 계정 생성 |
| `LOGIN_FAILED` | 로그인 실패 | 잘못된 비밀번호로 로그인 시도 |
| `ADMIN_LOGIN` | 관리자 로그인 | 관리자 페이지 로그인 성공 |
| `SECTION_SETTING_CHANGE` | 섹션 설정 변경 | 회사정보, 사업정보 등 섹션 설정 변경 |
| `BOARD_CREATE` | 게시판 생성 | 새 게시판 생성 |
| `BOARD_UPDATE` | 게시판 수정 | 게시판 설정 수정 |
| `BOARD_DELETE` | 게시판 삭제 | 게시판 삭제 |
| `POST_CREATE` | 게시글 작성 | Q&A, 견적문의 게시글 작성 |
| `POST_ANSWER` | 관리자 답변 | Q&A, 견적문의에 관리자 답변 작성 |
| `ERROR` | 오류 로그 | 각종 액션 실행 중 오류 발생 |

## 메타데이터 (metadata JSONB)

로그 타입에 따라 다른 메타데이터를 저장할 수 있습니다.

### 섹션 설정 변경 (SECTION_SETTING_CHANGE)

```json
{
  "sectionName": "회사정보",
  "beforeValue": "기존 설정값",
  "afterValue": "새로운 설정값"
}
```

### 게시판 관련 (BOARD_CREATE, BOARD_UPDATE, BOARD_DELETE)

```json
{
  "boardName": "Q&A"
}
```

### 게시글 작성 (POST_CREATE)

```json
{
  "boardName": "Q&A",
  "postId": "uuid-here"
}
```

### 관리자 답변 (POST_ANSWER)

```json
{
  "boardName": "견적문의",
  "postId": "uuid-here"
}
```

### 오류 로그 (ERROR)

```json
{
  "errorMessage": "파일 크기가 5MB를 초과합니다.",
  "stackTrace": "Error: ..." // 선택적
}
```

## 인덱스

다음 인덱스가 생성되어 있습니다:

1. **idx_activity_logs_log_type**: 로그 타입별 조회
2. **idx_activity_logs_user_id**: 사용자별 조회
3. **idx_activity_logs_created_at**: 시간별 조회 (최신순)
4. **idx_activity_logs_type_created_at**: 로그 타입 + 시간 복합 인덱스
5. **idx_activity_logs_ip_address**: IP 주소별 조회
6. **GIN 인덱스**: 메타데이터 내 특정 필드 검색용
   - postId
   - boardName
   - sectionName

## RLS (Row Level Security) 정책

1. **Users can view their own logs**: 사용자는 자신의 로그만 조회 가능
2. **Admins can view all logs**: 관리자는 모든 로그 조회 가능
3. **System can insert all logs**: 시스템은 모든 로그 삽입 가능
4. **Admins can delete logs**: 관리자만 로그 삭제 가능

## 사용 예시

### 로그 삽입

```sql
-- 사용자 가입 로그
INSERT INTO activity_logs (user_id, user_name, log_type, action, details, ip_address)
VALUES (
  'user-uuid',
  '김철수',
  'USER_SIGNUP',
  '사용자 가입',
  '일반 사용자 가입 완료',
  '192.168.1.100'
);

-- 관리자 로그인 로그
INSERT INTO activity_logs (user_id, user_name, log_type, action, details, ip_address)
VALUES (
  'admin-uuid',
  '시온관리자',
  'ADMIN_LOGIN',
  '관리자 로그인',
  '관리자 페이지 로그인 성공',
  '192.168.1.100'
);

-- 섹션 설정 변경 로그
INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
VALUES (
  'admin-uuid',
  '시온관리자',
  'SECTION_SETTING_CHANGE',
  '섹션 설정 변경',
  '회사정보 섹션 설정 변경',
  '{"sectionName": "회사정보", "beforeValue": "기존값", "afterValue": "새값"}'::jsonb,
  '192.168.1.100'
);

-- 오류 로그
INSERT INTO activity_logs (user_id, user_name, log_type, action, details, metadata, ip_address)
VALUES (
  'admin-uuid',
  '시온관리자',
  'ERROR',
  '오류 발생',
  '이미지 업로드 중 오류 발생',
  '{"errorMessage": "파일 크기가 5MB를 초과합니다."}'::jsonb,
  '192.168.1.100'
);
```

### 로그 조회

```sql
-- 최근 100개 로그 조회
SELECT * FROM activity_logs
ORDER BY created_at DESC
LIMIT 100;

-- 특정 로그 타입 조회
SELECT * FROM activity_logs
WHERE log_type = 'ERROR'
ORDER BY created_at DESC;

-- 특정 사용자의 로그 조회
SELECT * FROM activity_logs
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- 특정 게시글 관련 로그 조회
SELECT * FROM activity_logs
WHERE metadata->>'postId' = 'post-uuid'
ORDER BY created_at DESC;

-- 오늘의 오류 로그 조회
SELECT * FROM activity_logs
WHERE log_type = 'ERROR'
  AND created_at >= CURRENT_DATE
ORDER BY created_at DESC;

-- 최근 7일간의 관리자 로그인 조회
SELECT * FROM activity_logs
WHERE log_type = 'ADMIN_LOGIN'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### 로그 통계

```sql
-- 로그 타입별 개수
SELECT log_type, COUNT(*) as count
FROM activity_logs
GROUP BY log_type
ORDER BY count DESC;

-- 일별 로그 개수
SELECT DATE(created_at) as date, COUNT(*) as count
FROM activity_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 사용자별 로그 개수 (상위 10명)
SELECT user_name, COUNT(*) as count
FROM activity_logs
WHERE user_id IS NOT NULL
GROUP BY user_name
ORDER BY count DESC
LIMIT 10;
```

## 로그 정리

90일 이상 된 로그를 자동으로 삭제하는 함수가 제공됩니다:

```sql
-- 오래된 로그 삭제
SELECT cleanup_old_activity_logs();
```

## 주의사항

1. **로그는 삭제하지 않는 것을 권장**: 감사(audit) 목적으로 로그는 영구 보관하는 것이 좋습니다.
2. **메타데이터 구조**: metadata 필드는 JSONB이므로 유연하게 사용할 수 있지만, 일관된 구조를 유지하는 것이 좋습니다.
3. **성능**: 대용량 데이터의 경우 파티셔닝을 고려하세요.
4. **개인정보**: IP 주소, User-Agent 등은 개인정보에 해당할 수 있으므로 보관 기간을 고려하세요.

## 마이그레이션 적용

```bash
# Supabase CLI를 사용한 마이그레이션 적용
supabase migration up

# 또는 Supabase Dashboard에서 직접 SQL 실행
```

