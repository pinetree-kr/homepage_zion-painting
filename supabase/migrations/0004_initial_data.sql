-- ============================================================================
-- 초기 데이터 삽입
-- ============================================================================

-- ============================================================================
-- 1. 기본 게시판 데이터 삽입
-- ============================================================================

INSERT INTO boards (code, name, description, is_public, allow_anonymous, allow_comment, allow_file, allow_guest, display_order, visibility) VALUES
('notices', '공지사항', '공지사항 게시판', TRUE, FALSE, FALSE, FALSE, FALSE, 0, 'public'),
('qna', 'Q&A', 'Q&A 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 1, 'public'),
('quotes', '견적문의', '견적문의 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 2, 'public'),
('reviews', '고객후기', '고객후기 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 3, 'public')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. site_settings 초기 레코드 생성
-- ============================================================================

INSERT INTO site_settings (
  id, 
  contact,
  default_boards
)
SELECT 
  gen_random_uuid(), 
  '{}'::jsonb,
  '{"notice": {"id": null, "name": "공지사항", "display_order": 0}, "inquiry": {"id": null, "name": "Q&A", "display_order": 1}, "pds": {"id": null, "name": "자료실", "display_order": 2}, "review": {"id": null, "name": "고객후기", "display_order": 3}, "quote": {"id": null, "name": "견적문의", "display_order": 4}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE deleted_at IS NULL);

-- ============================================================================
-- 3. pages 테이블 초기 데이터 삽입
-- ============================================================================

-- 3-1. hero_default (프롤로그 기본 설정)
INSERT INTO pages (code, page, section_type, display_order, status, metadata)
VALUES (
  'hero_default',
  'home',
  'hero',
  0,
  'published',
  '{"default_title": "환영합니다", "default_description": ""}'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- 3-2. hero_carousel_items (프롤로그 캐러셀 아이템들)
INSERT INTO pages (code, page, section_type, display_order, status, metadata)
VALUES (
  'hero_carousel_items',
  'home',
  'carousel',
  1,
  'published',
  '{"items": [{"image_url": "", "title": null, "description": null, "display_order": 1}, {"image_url": "", "title": null, "description": null, "display_order": 2}, {"image_url": "", "title": null, "description": null, "display_order": 3}]}'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- 3-3. company_intro (회사 정보)
INSERT INTO pages (code, page, section_type, display_order, status, metadata)
VALUES (
  'company_intro',
  'about',
  'rich_text',
  0,
  'published',
  '{"introduction": "", "vision": "", "greetings": "", "mission": "", "strengths": [], "values": [], "histories": [], "organization_members": []}'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- 3-4. business_areas (사업 정보)
INSERT INTO pages (code, page, section_type, display_order, status, metadata)
VALUES (
  'business_areas',
  'business',
  'rich_text',
  0,
  'published',
  '{"introduction": "", "areas": []}'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- 3-5. product_intro (제품 정보)
INSERT INTO pages (code, page, section_type, display_order, status, metadata)
VALUES (
  'product_intro',
  'products',
  'rich_text',
  0,
  'published',
  '{"introduction": "", "review_board_id": null, "quote_board_id": null}'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 4. 기본 권한 정책 데이터 삽입 (기존 게시판에 대해)
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

