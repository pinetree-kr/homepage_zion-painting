
-- 기본 게시판 데이터 삽입
INSERT INTO boards (code, name, description, is_public, allow_anonymous, allow_comment, allow_file, allow_guest, display_order) VALUES
('notices', '공지사항', '공지사항 게시판', TRUE, FALSE, FALSE, FALSE, FALSE, 0),
('qna', 'Q&A', 'Q&A 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 1),
('quotes', '견적문의', '견적문의 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 2),
('reviews', '고객후기', '고객후기 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 3)
ON CONFLICT (code) DO NOTHING;

-- site_settings 초기 레코드 생성
INSERT INTO site_settings (
  id, 
  prologue_default_title, 
  prologue_default_description,
  contact_email,
  contact_address,
  notice_board_id,
  inquire_board_id,
  pds_board_id
)
SELECT gen_random_uuid(), '환영합니다', '', '', '', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE deleted_at IS NULL);


DELETE FROM product_info WHERE id is not null;

INSERT INTO product_info (id, introduction, review_board_id, quote_board_id, created_at, updated_at)
VALUES (gen_random_uuid(), '', NULL, NULL, NOW(), NOW());


-- ============================================================================
-- 5. 기본 권한 정책 데이터 삽입 (기존 게시판에 대해)
-- ============================================================================

-- 모든 게시판에 대해 admin과 member 역할의 기본 정책 생성
INSERT INTO board_policies (board_id, role, post_list, post_create, post_read, post_edit, post_delete, cmt_create, cmt_read, cmt_edit, cmt_delete, file_upload, file_download)
SELECT 
  b.id,
  'admin'::app_role,
  TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
FROM boards b
WHERE b.deleted_at IS NULL
ON CONFLICT (board_id, role) DO NOTHING;

INSERT INTO board_policies (board_id, role, post_list, post_create, post_read, post_edit, post_delete, cmt_create, cmt_read, cmt_edit, cmt_delete, file_upload, file_download)
SELECT 
  b.id,
  'member'::app_role,
  TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
FROM boards b
WHERE b.deleted_at IS NULL
ON CONFLICT (board_id, role) DO NOTHING;
