-- 전체 스키마 통합 마이그레이션
-- RLS와 함수는 별도 파일로 분리됨

-- ============================================================================
-- 1. ENUM 타입 생성
-- ============================================================================

CREATE TYPE admin_role AS ENUM ('system', 'contents');
CREATE TYPE document_status AS ENUM ('draft', 'published');
CREATE TYPE inquiry_type AS ENUM ('general', 'quote');
CREATE TYPE inquiry_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE inquiry_status AS ENUM ('pending', 'approved', 'answered', 'rejected');

-- ============================================================================
-- 2. 기본 테이블 생성
-- ============================================================================

-- 2-1. 사용자 프로필 테이블 (auth.users와 연동)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255),
  last_login TIMESTAMPTZ,
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;

-- 2-2. 관리자 테이블 (auth.users와 연동)
CREATE TABLE IF NOT EXISTS administrators (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_administrators_role ON administrators(role);
CREATE INDEX IF NOT EXISTS idx_administrators_deleted_at ON administrators(deleted_at) WHERE deleted_at IS NULL;

-- 2-3. 프롤로그 캐러셀 아이템 테이블
CREATE TABLE IF NOT EXISTS prologue_carousel_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prologue_carousel_order ON prologue_carousel_items(display_order);

-- 2-4. 회사 정보 테이블
CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction TEXT,
  vision TEXT,
  greetings TEXT,
  mission TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  values JSONB DEFAULT '[]'::jsonb,
  histories JSONB DEFAULT '[]'::jsonb,
  organization_members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 회사 정보는 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS company_info_single_row ON company_info ((1));

-- 2-5. 사업소개 테이블
CREATE TABLE IF NOT EXISTS business_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction TEXT,
  areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- business_info는 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS business_info_single_row ON business_info ((1));

-- 2-6. business_categories 테이블 생성 (적용산업)
CREATE TABLE IF NOT EXISTS business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_categories_title ON business_categories(title);
CREATE INDEX IF NOT EXISTS idx_business_categories_display_order ON business_categories(display_order);

-- 2-7. 사업 실적 테이블
CREATE TABLE IF NOT EXISTS business_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_summary VARCHAR(50) NOT NULL DEFAULT '',
  achievement_date DATE NOT NULL,
  category_id UUID REFERENCES business_categories(id) ON DELETE SET NULL,
  status document_status NOT NULL DEFAULT 'draft',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_business_achievements_date ON business_achievements(achievement_date DESC);
CREATE INDEX IF NOT EXISTS idx_business_achievements_category_id ON business_achievements(category_id);
CREATE INDEX IF NOT EXISTS idx_business_achievements_deleted_at ON business_achievements(deleted_at) WHERE deleted_at IS NULL;

-- 2-8. product_categories 테이블 생성
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_title ON product_categories(title);
CREATE INDEX IF NOT EXISTS idx_product_categories_display_order ON product_categories(display_order);

-- 2-9. 제품 테이블
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_summary VARCHAR(50) NOT NULL DEFAULT '',
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  specs JSONB DEFAULT '[]'::jsonb,
  status document_status NOT NULL DEFAULT 'draft',
  thumbnail_url TEXT,
  extra_json TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;

-- 2-10. boards 테이블 (allow_product_link 포함)
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE, -- 게시판 코드 (ex: notice, qna, quote, review)
  name VARCHAR(255) NOT NULL, -- 게시판 이름 (ex: 공지사항, Q&A, 견적, 리뷰)
  description TEXT, -- 게시판 설명
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- 게시판 공개 여부
  allow_anonymous BOOLEAN NOT NULL DEFAULT FALSE, -- 익명 게시 여부
  allow_comment BOOLEAN NOT NULL DEFAULT FALSE, -- 댓글 허용 여부
  allow_file BOOLEAN NOT NULL DEFAULT FALSE, -- 파일 첨부 허용 여부
  allow_guest BOOLEAN NOT NULL DEFAULT FALSE, -- 비로그인 게시 허용 여부
  allow_secret BOOLEAN NOT NULL DEFAULT FALSE, -- 비밀글 허용 여부
  display_order INTEGER NOT NULL DEFAULT 0, -- 게시판 순서
  allow_product_link BOOLEAN NOT NULL DEFAULT FALSE, -- 제품 연결 허용 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_boards_code ON boards(code);
CREATE INDEX IF NOT EXISTS idx_boards_deleted_at ON boards(deleted_at) WHERE deleted_at IS NULL;

-- 기본 게시판 데이터 삽입
INSERT INTO boards (code, name, description, is_public, allow_anonymous, allow_comment, allow_file, allow_guest, display_order, allow_product_link) VALUES
('notices', '공지사항', '공지사항 게시판', TRUE, FALSE, FALSE, FALSE, FALSE, 0, FALSE),
('qna', 'Q&A', 'Q&A 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 1, FALSE),
('quotes', '견적문의', '견적문의 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 2, TRUE),
('reviews', '고객후기', '고객후기 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 3, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 2-11. board_categories 테이블 생성 (게시판 전용 카테고리)
CREATE TABLE IF NOT EXISTS board_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_board_categories_board_id ON board_categories(board_id);

-- 2-12. 게시글 테이블 (공지사항, Q&A, 견적, 리뷰)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  category_id UUID REFERENCES board_categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_summary VARCHAR(50) NOT NULL DEFAULT '',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  author_phone VARCHAR(50),
  author_ip VARCHAR(46),
  status document_status NOT NULL DEFAULT 'draft',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE, -- 고정 게시글 여부
  is_secret BOOLEAN NOT NULL DEFAULT FALSE, -- 비밀 게시글 여부
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  extra_json TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_posts_board_id ON posts(board_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at) WHERE deleted_at IS NULL;

-- 2-13. post_files 테이블
CREATE TABLE IF NOT EXISTS post_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_files_post_id ON post_files(post_id);

-- 2-14. 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  author_ip VARCHAR(46),
  context TEXT NOT NULL DEFAULT '',
  status document_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. product_reviews 및 product_inquiries 테이블 생성
-- ============================================================================

-- 3-1. product_reviews 테이블 생성 (posts와 products 모두 참조)
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL DEFAULT 0, -- 별점 (1~5)
  pros TEXT NOT NULL DEFAULT '', -- 장점
  cons TEXT NOT NULL DEFAULT '', -- 단점
  purchase_date DATE NOT NULL, -- 실제 구매일
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_post_id ON product_reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_deleted_at ON product_reviews(deleted_at) WHERE deleted_at IS NULL;

-- 3-2. product_inquiries 테이블 생성 (posts와 products 모두 참조)
CREATE TABLE IF NOT EXISTS product_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type inquiry_type NOT NULL DEFAULT 'general',
  company_name VARCHAR(255), -- B2B 문의 시
  budget_min INTEGER NOT NULL DEFAULT 0,
  budget_max INTEGER NOT NULL DEFAULT 0,
  expected_start_at TIMESTAMPTZ,
  expected_end_at TIMESTAMPTZ,
  internal_notes TEXT, -- 관리자만 보는 메모
  priority inquiry_priority NOT NULL DEFAULT 'medium',
  inquiry_status inquiry_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_product_inquiries_post_id ON product_inquiries(post_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_product_id ON product_inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_created_at ON product_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_deleted_at ON product_inquiries(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_inquiries_inquiry_status ON product_inquiries(inquiry_status);

-- ============================================================================
-- 4. site_settings 테이블 생성 (모든 설정 통합)
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- prologue_settings 통합 필드
  prologue_default_title TEXT, -- 프롤로그 기본 제목
  prologue_default_description TEXT, -- 프롤로그 기본 설명
  -- contact_info 통합 필드
  contact_email VARCHAR(255), -- 연락처 이메일
  contact_address TEXT, -- 연락처 주소
  contact_business_hours TEXT, -- 영업시간
  contact_phone_primary VARCHAR(50), -- 주요 전화번호
  contact_phone_secondary VARCHAR(50), -- 보조 전화번호
  contact_fax VARCHAR(50), -- 팩스
  contact_map_url VARCHAR(255), -- 지도 URL
  contact_extra_json TEXT, -- 추가 정보 (JSON)

  notice_board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  inquire_board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  pds_board_id UUID REFERENCES boards(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_site_settings_deleted_at ON site_settings(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_site_settings_notice_board_id ON site_settings(notice_board_id) WHERE notice_board_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_site_settings_inquire_board_id ON site_settings(inquire_board_id) WHERE inquire_board_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_site_settings_pds_board_id ON site_settings(pds_board_id) WHERE pds_board_id IS NOT NULL;


-- site_settings 단일 레코드 제약조건 (deleted_at이 NULL인 레코드는 하나만 허용)
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_single_row ON site_settings ((1)) WHERE deleted_at IS NULL;

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

-- ============================================================================
-- 5. updated_at 자동 업데이트 함수 및 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 추가
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_administrators_updated_at BEFORE UPDATE ON administrators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prologue_carousel_items_updated_at BEFORE UPDATE ON prologue_carousel_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON company_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_info_updated_at BEFORE UPDATE ON business_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_categories_updated_at BEFORE UPDATE ON business_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_achievements_updated_at BEFORE UPDATE ON business_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_inquiries_updated_at BEFORE UPDATE ON product_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Storage 버킷 생성
-- ============================================================================

-- 6-1. CKEditor5 에디터 이미지 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editor-images',
  'editor-images',
  true, -- 공개 버킷
  10485760, -- 10MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 6-2. 게시물 첨부 파일 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-files',
  'post-files',
  true, -- 공개 버킷
  1048576, -- 1MB 제한
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 6-3. 프롤로그 캐러셀 이미지 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prologue-carousel',
  'prologue-carousel',
  true, -- 공개 버킷
  5242880, -- 5MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

