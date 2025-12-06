-- ============================================================================
-- 스키마 정의: ENUM, 테이블, 인덱스, Storage 버킷
-- ============================================================================

-- ============================================================================
-- 1. ENUM 타입 생성
-- ============================================================================

CREATE TYPE admin_role AS ENUM ('system', 'contents');
CREATE TYPE document_status AS ENUM ('draft', 'published');
CREATE TYPE inquiry_type AS ENUM ('general', 'quote');
CREATE TYPE inquiry_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE inquiry_status AS ENUM ('pending', 'approved', 'answered', 'rejected');
CREATE TYPE visible_type AS ENUM ('public', 'member', 'owner');
CREATE TYPE app_role AS ENUM ('member', 'admin');
CREATE TYPE log_type AS ENUM (
  'USER_SIGNUP',              -- 사용자 가입
  'ADMIN_SIGNUP',             -- 관리자 가입
  'LOGIN_FAILED',             -- 로그인 실패
  'ADMIN_LOGIN',              -- 관리자 로그인
  'SECTION_SETTING_CHANGE',   -- 섹션 설정 변경
  'BOARD_CREATE',             -- 게시판 생성
  'BOARD_UPDATE',             -- 게시판 수정
  'BOARD_DELETE',             -- 게시판 삭제
  'POST_CREATE',              -- 게시글 작성
  'POST_UPDATE',              -- 게시글 수정
  'POST_DELETE',              -- 게시글 삭제
  'POST_ANSWER',              -- 관리자 답변
  'ERROR'                     -- 오류 로그
);

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

-- 2-3. pages 테이블 생성 (WordPress 스타일의 유연한 페이지/섹션 관리)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,              -- 'company_intro', 'business_areas', 'hero_carousel', 'hero_default', 'product_intro' ...
  page TEXT NOT NULL,              -- 'home', 'about', 'business', 'products', 'landing' ...
  section_type TEXT NOT NULL,      -- 'rich_text', 'carousel', 'timeline', 'hero' ...
  display_order INTEGER NOT NULL DEFAULT 0,
  status document_status NOT NULL DEFAULT 'draft',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- code는 고유해야 함 (같은 code는 하나만 존재)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_code ON pages(code);

-- page와 section_type으로 조회 최적화
CREATE INDEX IF NOT EXISTS idx_pages_page ON pages(page);
CREATE INDEX IF NOT EXISTS idx_pages_section_type ON pages(section_type);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_display_order ON pages(page, display_order);

-- metadata JSONB 인덱스 (GIN 인덱스로 JSONB 필드 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_pages_metadata ON pages USING GIN (metadata);

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

-- 2-10. boards 테이블
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE, -- 게시판 코드 (ex: notice, qna, quote, review)
  name VARCHAR(255) NOT NULL, -- 게시판 이름 (ex: 공지사항, Q&A, 견적, 리뷰)
  description TEXT, -- 게시판 설명
  display_order INTEGER NOT NULL DEFAULT 0, -- 게시판 순서
  visibility visible_type NOT NULL DEFAULT 'public', -- 공개 범위: public(공개), member(회원용), owner(1:1 게시판)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

COMMENT ON COLUMN boards.visibility IS '공개 범위: public(공개), member(회원용), owner(1:1 게시판)';

CREATE INDEX IF NOT EXISTS idx_boards_code ON boards(code);
CREATE INDEX IF NOT EXISTS idx_boards_deleted_at ON boards(deleted_at) WHERE deleted_at IS NULL;

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
  -- contact_info 통합 필드
  contact JSONB DEFAULT '{}'::jsonb,
  default_boards JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_site_settings_deleted_at ON site_settings(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_site_settings_contact ON site_settings USING GIN (contact);
CREATE INDEX IF NOT EXISTS idx_site_settings_default_boards ON site_settings USING GIN (default_boards);

-- site_settings 단일 레코드 제약조건 (deleted_at이 NULL인 레코드는 하나만 허용)
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_single_row ON site_settings ((1)) WHERE deleted_at IS NULL;

-- ============================================================================
-- 5. board_policies 테이블 생성 (권한 매트릭스)
-- ============================================================================

CREATE TABLE IF NOT EXISTS board_policies (
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  post_list BOOLEAN NOT NULL DEFAULT TRUE, -- 게시글 목록 접근 권한
  post_create BOOLEAN NOT NULL DEFAULT TRUE, -- 글 작성권한
  post_read BOOLEAN NOT NULL DEFAULT TRUE, -- 글 읽기권한
  post_edit BOOLEAN NOT NULL DEFAULT TRUE, -- 글 수정권한 (member는 자기것만)
  post_delete BOOLEAN NOT NULL DEFAULT TRUE, -- 글 삭제권한 (member는 자기것만)
  cmt_create BOOLEAN NOT NULL DEFAULT TRUE, -- 댓글 작성권한
  cmt_read BOOLEAN NOT NULL DEFAULT TRUE, -- 댓글 읽기권한
  cmt_edit BOOLEAN NOT NULL DEFAULT TRUE, -- 댓글 수정권한 (member는 자기것만)
  cmt_delete BOOLEAN NOT NULL DEFAULT TRUE, -- 댓글 삭제권한 (member는 자기것만)
  file_upload BOOLEAN NOT NULL DEFAULT TRUE, -- 파일 업로드 권한
  file_download BOOLEAN NOT NULL DEFAULT TRUE, -- 파일 다운로드 권한
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (board_id, role)
);

-- role로 검색할 때를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_board_policies_role ON board_policies(role);

-- ============================================================================
-- 6. activity_logs 테이블 생성
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 사용자 정보
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,  -- 사용자 이름 (user_id가 NULL일 수 있으므로 별도 저장)
  
  -- 로그 정보
  log_type log_type NOT NULL,
  action VARCHAR(255) NOT NULL,     -- 작업명 (예: "관리자 로그인", "게시판 생성")
  details TEXT,                     -- 상세 설명
  
  -- 메타데이터 (JSONB로 유연하게 저장)
  metadata JSONB DEFAULT '{}'::jsonb,
  -- metadata 구조 예시:
  -- {
  --   "sectionName": "회사정보",
  --   "boardName": "Q&A",
  --   "postId": "uuid-here",
  --   "errorMessage": "파일 크기가 5MB를 초과합니다.",
  --   "beforeValue": "기존 설정값",
  --   "afterValue": "새로운 설정값"
  -- }
  
  -- 네트워크 정보
  ip_address INET,                  -- IP 주소 (IPv4/IPv6 지원)
  user_agent TEXT,                  -- User-Agent (선택적)
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
-- 로그 타입별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_activity_logs_log_type ON activity_logs(log_type);

-- 사용자별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id) WHERE user_id IS NOT NULL;

-- 시간별 조회 최적화 (최신순 조회)
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 복합 인덱스: 로그 타입 + 시간 (자주 사용되는 쿼리 패턴)
CREATE INDEX IF NOT EXISTS idx_activity_logs_type_created_at ON activity_logs(log_type, created_at DESC);

-- IP 주소별 조회 (보안 분석용)
CREATE INDEX IF NOT EXISTS idx_activity_logs_ip_address ON activity_logs(ip_address) WHERE ip_address IS NOT NULL;

-- 주석 추가
COMMENT ON TABLE activity_logs IS '시스템의 모든 활동과 오류를 기록하는 로그 테이블';
COMMENT ON COLUMN activity_logs.log_type IS '로그 타입 (사용자 가입, 관리자 로그인, 오류 등)';
COMMENT ON COLUMN activity_logs.metadata IS '추가 정보를 저장하는 JSONB 필드 (섹션명, 게시판명, 게시글 ID, 오류 메시지, 변경 전/후 값 등)';
COMMENT ON COLUMN activity_logs.ip_address IS '요청자의 IP 주소 (IPv4/IPv6 지원)';
COMMENT ON COLUMN activity_logs.user_agent IS '요청자의 User-Agent 정보';

-- ============================================================================
-- 7. Storage 버킷 생성
-- ============================================================================

-- 8-1. CKEditor5 에디터 이미지 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editor-images',
  'editor-images',
  true, -- 공개 버킷
  10485760, -- 10MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 8-2. 게시물 첨부 파일 버킷
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

-- 8-3. 프롤로그 캐러셀 이미지 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prologue-carousel',
  'prologue-carousel',
  true, -- 공개 버킷
  5242880, -- 5MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

