-- 관리자 모드 설정 테이블 생성 마이그레이션

CREATE TYPE admin_role AS ENUM ('system', 'contents');
-- CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE document_status AS ENUM ('draft', 'published');
CREATE TYPE inquiry_type AS ENUM ('general', 'quote');
CREATE TYPE inquiry_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE inquiry_status AS ENUM ('pending', 'approved', 'answered', 'rejected');

-- 0. 사용자 프로필 테이블 (auth.users와 연동)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255),
  -- role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  last_login TIMESTAMPTZ,
  phone VARCHAR(20),

  -- status user_status NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
-- CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
-- CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;


-- 0-1. 관리자 테이블 (auth.users와 연동)
CREATE TABLE IF NOT EXISTS administrators (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_administrators_role ON administrators(role);
CREATE INDEX IF NOT EXISTS idx_administrators_deleted_at ON administrators(deleted_at) WHERE deleted_at IS NULL;

-- 1. 프롤로그 설정 테이블
CREATE TABLE IF NOT EXISTS prologue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_title TEXT,
  default_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프롤로그 설정은 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS prologue_settings_single_row ON prologue_settings ((1));

INSERT INTO prologue_settings (default_title, default_description) VALUES ('환영합니다', '');

-- 2. 프롤로그 캐러셀 아이템 테이블
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

-- 3. 회사 정보 테이블
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

 -- 4. 사업소개 테이블
CREATE TABLE IF NOT EXISTS business_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction TEXT,
  areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- business_info는 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS business_info_single_row ON business_info ((1));

-- 5. business_categories 테이블 생성 (적용산업)
CREATE TABLE IF NOT EXISTS business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_categories_title ON business_categories(title);
-- display_order 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_business_categories_display_order ON business_categories(display_order);


-- 6. 사업 실적 테이블
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

-- 7. 연락처 정보 테이블
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  business_hours TEXT,
  phone_primary VARCHAR(50),
  phone_secondary VARCHAR(50),
  fax VARCHAR(50),
  map_url VARCHAR(255),
  extra_json TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 연락처 정보는 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS contact_info_single_row ON contact_info ((1));


-- 8.0. product_categories 테이블 생성 (적용산업)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_title ON product_categories(title);
-- display_order 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_product_categories_display_order ON product_categories(display_order);


-- 8. 제품 테이블
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
  display_order INTEGER NOT NULL DEFAULT 0, -- 게시판 순서
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);
  
INSERT INTO boards (code, name, description, is_public, allow_anonymous, allow_comment, allow_file, allow_guest, display_order) VALUES
('notices', '공지사항', '공지사항 게시판', TRUE, FALSE, FALSE, FALSE, FALSE, 0),
('qna', 'Q&A', 'Q&A 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 1),
('quotes', '견적문의', '견적문의 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 2),
('reviews', '고객후기', '고객후기 게시판', TRUE, FALSE, TRUE, FALSE, FALSE, 3);

-- 9.0. board_categories 테이블 생성 (게시판 전용 카테고리)
CREATE TABLE IF NOT EXISTS board_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 게시글 테이블 (공지사항, Q&A, 견적, 리뷰)
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

-- 10. 댓글 테이블
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

-- 리뷰 전용 게시판 (확장)
CREATE TABLE IF NOT EXISTS post_reviews (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255),
  
  rating INTEGER NOT NULL DEFAULT 0, -- 별점 (1~5)
  pros TEXT NOT NULL DEFAULT '', -- 장점
  cons TEXT NOT NULL DEFAULT '', -- 단점

  purchase_date DATE NOT NULL, -- 실제 구매일

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_post_reviews_post_id ON post_reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_product_id ON post_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_created_at ON post_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reviews_deleted_at ON post_reviews(deleted_at) WHERE deleted_at IS NULL;

-- 일반/견적문의 전용 게시판 (확장)
CREATE TABLE IF NOT EXISTS post_inquiries (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type inquiry_type NOT NULL DEFAULT 'general',

  -- posts의 내용을 분리저장
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  author_phone VARCHAR(50),
  author_ip VARCHAR(46),

  company_name VARCHAR(255), -- B2B 문의 시

  subject VARCHAR(255), -- 문의 제목을 별도로 둘 시

  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255),

  -- 견적 관련필드
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

CREATE INDEX IF NOT EXISTS idx_post_inquiries_post_id ON post_inquiries(post_id);
CREATE INDEX IF NOT EXISTS idx_post_inquiries_product_id ON post_inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_post_inquiries_created_at ON post_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_inquiries_deleted_at ON post_inquiries(deleted_at) WHERE deleted_at IS NULL;

-- updated_at 자동 업데이트를 위한 함수 생성
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

CREATE TRIGGER update_prologue_settings_updated_at BEFORE UPDATE ON prologue_settings
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

CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- RLS (Row Level Security) 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE prologue_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prologue_carousel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 관리자 여부를 확인하는 SECURITY DEFINER 함수 생성
-- 이 함수는 RLS를 우회하여 무한 재귀 없이 관리자 여부를 확인할 수 있습니다
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM administrators 
    WHERE administrators.id = user_id
    AND administrators.deleted_at IS NULL
    -- SELECT 1 FROM profiles
    -- WHERE profiles.id = user_id AND profiles.role = 'admin'
  );
$$;


-- -- NOT USING THIS FUNCTIONS NOW

-- CREATE OR REPLACE FUNCTION is_system_admin(user_id UUID)
-- RETURNS BOOLEAN
-- LANGUAGE sql
-- SECURITY DEFINER
-- SET search_path = public
-- STABLE
-- AS $$
--   SELECT EXISTS (
--     SELECT 1 FROM administrators 
--     WHERE administrators.id = user_id
--     AND administrators.role = 'system'
--   );
-- $$;

-- CREATE OR REPLACE FUNCTION is_contents_admin(user_id UUID)
-- RETURNS BOOLEAN
-- LANGUAGE sql
-- SECURITY DEFINER
-- SET search_path = public
-- STABLE
-- AS $$
--   SELECT EXISTS (
--     SELECT 1 FROM administrators 
--     WHERE administrators.id = user_id
--     AND administrators.role = 'contents'
--   );
-- $$;


-- ============================================
-- RLS 정책 설정 (테이블별 정렬)
-- ============================================

-- 1. profiles 테이블 정책
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- 2. administrators 테이블 정책
CREATE POLICY "Users can view own administrator record" ON administrators
  FOR SELECT USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Admins can view all administrators" ON administrators
  FOR SELECT USING (is_admin(auth.uid()));

-- 3. prologue_settings 테이블 정책
CREATE POLICY "Public read access for prologue_settings" ON prologue_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System admin write access for prologue_settings" ON prologue_settings;

CREATE POLICY "Admin write access for prologue_settings" ON prologue_settings
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for prologue_settings" ON prologue_settings
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for prologue_settings" ON prologue_settings
  FOR DELETE USING (is_admin(auth.uid()));

-- 4. prologue_carousel_items 테이블 정책
CREATE POLICY "Public read access for prologue_carousel_items" ON prologue_carousel_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System admin write access for prologue_carousel_items" ON prologue_carousel_items;

CREATE POLICY "Admin write access for prologue_carousel_items" ON prologue_carousel_items
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for prologue_carousel_items" ON prologue_carousel_items
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for prologue_carousel_items" ON prologue_carousel_items
  FOR DELETE USING (is_admin(auth.uid()));

-- 5. company_info 테이블 정책
CREATE POLICY "Public read access for company_info" ON company_info
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System admin write access for company_info" ON company_info;

CREATE POLICY "Admin write access for company_info" ON company_info
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for company_info" ON company_info
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for company_info" ON company_info
  FOR DELETE USING (is_admin(auth.uid()));

-- 6. business_info 테이블 정책
CREATE POLICY "Public read access for business_info" ON business_info
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for business_info" ON business_info
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for business_info" ON business_info
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for business_info" ON business_info
  FOR DELETE USING (is_admin(auth.uid()));

-- 7. business_categories 테이블 정책
CREATE POLICY "Public read access for business_categories" ON business_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for business_categories" ON business_categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for business_categories" ON business_categories
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for business_categories" ON business_categories
  FOR DELETE USING (is_admin(auth.uid()));

-- 8. business_achievements 테이블 정책
CREATE POLICY "Admin can view all business_achievements" ON business_achievements
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Public read access for business_achievements" ON business_achievements
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "System admin write access for business_achievements" ON business_achievements;

CREATE POLICY "Admin write access for business_achievements" ON business_achievements
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for business_achievements" ON business_achievements
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for business_achievements" ON business_achievements
  FOR UPDATE USING (is_admin(auth.uid()));

-- 9. contact_info 테이블 정책
CREATE POLICY "Public read access for contact_info" ON contact_info
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System admin write access for contact_info" ON contact_info;

CREATE POLICY "Admin write access for contact_info" ON contact_info
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for contact_info" ON contact_info
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for contact_info" ON contact_info
  FOR DELETE USING (is_admin(auth.uid()));

-- 10. product_categories 테이블 정책
CREATE POLICY "Public read access for product_categories" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for product_categories" ON product_categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for product_categories" ON product_categories
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin soft delete access for product_categories" ON product_categories
  FOR UPDATE USING (is_admin(auth.uid()));

-- 11. products 테이블 정책
CREATE POLICY "Public read access for published products" ON products
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Admin can view all products" ON products
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "System admin write access for products" ON products;

CREATE POLICY "Admin write access for products" ON products
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for products" ON products
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for products" ON products
  FOR UPDATE USING (is_admin(auth.uid()));

-- 12. boards 테이블 정책
CREATE POLICY "Public read access for boards" ON boards
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Admin can view all boards" ON boards
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admin write access for boards" ON boards
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for boards" ON boards
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin soft delete access for boards" ON boards
  FOR UPDATE USING (is_admin(auth.uid()));

-- 13. board_categories 테이블 정책
CREATE POLICY "Public read access for board_categories" ON board_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for board_categories" ON board_categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for board_categories" ON board_categories
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin soft delete access for board_categories" ON board_categories
  FOR UPDATE USING (is_admin(auth.uid()));

-- 14. posts 테이블 정책
CREATE POLICY "Public read access for published posts" ON posts
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Authors can view own posts" ON posts
  FOR SELECT USING (auth.uid() = author_id AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins can update posts" ON posts
  FOR UPDATE USING (
    auth.uid() = author_id OR
    is_admin(auth.uid())
  );

CREATE POLICY "Authors and admins can delete posts" ON posts
  FOR UPDATE USING (
    auth.uid() = author_id OR
    is_admin(auth.uid())
  );

-- 15. post_files 테이블 정책
CREATE POLICY "Public read access for post_files" ON post_files
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create post_files" ON post_files
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authors and admins can update post_files" ON post_files
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_files.post_id 
      AND posts.author_id = auth.uid()
    ) OR
    is_admin(auth.uid())
  );

CREATE POLICY "Authors and admins can delete post_files" ON post_files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_files.post_id 
      AND posts.author_id = auth.uid()
    ) OR
    is_admin(auth.uid())
  );

-- 16. comments 테이블 정책
CREATE POLICY "Public read access for comments on published posts" ON comments
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.status = 'published'
      AND posts.deleted_at IS NULL
    )
  );

CREATE POLICY "Authors can view comments on own posts" ON comments
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.author_id = auth.uid()
      AND posts.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can view all comments" ON comments
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      -- AND posts.status = 'published'
    )
  );

CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete comments" ON comments
  FOR UPDATE USING (
    auth.uid() = author_id OR
    is_admin(auth.uid())
  );

-- 17. post_reviews 테이블 정책
CREATE POLICY "Public read access for published post_reviews" ON post_reviews
  FOR SELECT USING (deleted_at IS NULL);

-- 18. post_inquiries 테이블 정책
CREATE POLICY "Public read access for published post_inquiries" ON post_inquiries
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Authors can view own post_inquiries" ON post_inquiries
  FOR SELECT USING (auth.uid() = author_id AND deleted_at IS NULL);

-- 프롤로그 캐러셀 이미지를 위한 Storage 버킷 생성 및 정책 설정

-- Storage 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prologue-carousel',
  'prologue-carousel',
  true, -- 공개 버킷 (이미지 URL 직접 접근 가능)
  5242880, -- 5MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책: 모든 사용자가 읽기 가능 (공개 버킷)
CREATE POLICY "Public read access for prologue carousel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'prologue-carousel');

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "System admin upload access for prologue carousel images" ON storage.objects;
DROP POLICY IF EXISTS "System admin update access for prologue carousel images" ON storage.objects;
DROP POLICY IF EXISTS "System admin delete access for prologue carousel images" ON storage.objects;

-- Storage 정책: 관리자만 업로드 가능 (is_admin 함수 활용)
CREATE POLICY "Admin upload access for prologue carousel images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prologue-carousel' AND
  is_admin(auth.uid())
);

-- Storage 정책: 관리자만 업데이트 가능 (is_admin 함수 활용)
CREATE POLICY "Admin update access for prologue carousel images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'prologue-carousel' AND
  is_admin(auth.uid())
);

-- Storage 정책: 관리자만 삭제 가능 (is_admin 함수 활용)
CREATE POLICY "Admin delete access for prologue carousel images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prologue-carousel' AND
  is_admin(auth.uid())
);



-- 사용자 가입 시 프로필 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
