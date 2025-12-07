-- ============================================================================
-- 마이그레이션: 댓글 삭제 RLS 정책 수정
-- ============================================================================
-- 
-- 문제: comments 테이블에 중복된 UPDATE 정책이 있어 충돌 발생
--      - "Authors can update own comments" (275번 줄)
--      - "Authors and admins can update and soft delete own comments" (278번 줄)
-- 
-- 해결: 중복된 정책 제거 (275번 정책 삭제, 278번 정책만 유지)
-- ============================================================================

-- 중복된 정책 삭제
DROP POLICY IF EXISTS "Authors can update own comments" ON comments;

-- 기존 정책이 이미 올바르게 설정되어 있으므로 추가 작업 불필요
-- "Authors and admins can update and soft delete own comments" 정책이
-- 작성자(auth.uid() = author_id) 또는 관리자(is_admin(auth.uid()))의
-- UPDATE 작업을 허용하므로 soft delete도 정상 작동합니다.
