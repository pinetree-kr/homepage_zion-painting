-- 관리자 모드 설정 테이블 생성 마이그레이션

-- 0. 사용자 프로필 테이블 (auth.users와 연동)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- 0-1. 관리자 테이블 (auth.users와 연동)
CREATE TABLE IF NOT EXISTS administrators (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'system' CHECK (role IN ('system', 'contents')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_administrators_role ON administrators(role);

-- 1. 프롤로그 설정 테이블
CREATE TABLE IF NOT EXISTS prologue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프롤로그 설정은 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS prologue_settings_single_row ON prologue_settings ((1));

-- 2. 프롤로그 캐러셀 아이템 테이블
CREATE TABLE IF NOT EXISTS prologue_carousel_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prologue_carousel_order ON prologue_carousel_items(display_order);

-- 3. 회사 정보 테이블
CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_content TEXT,
  organization_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 회사 정보는 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS company_info_single_row ON company_info ((1));

-- 4. 회사 연혁 테이블
CREATE TABLE IF NOT EXISTS company_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year VARCHAR(10) NOT NULL,
  month VARCHAR(10),
  content TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_history_order ON company_history(display_order);
CREATE INDEX IF NOT EXISTS idx_company_history_year ON company_history(year);

-- 5. 사업 분야 테이블
CREATE TABLE IF NOT EXISTS business_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_areas_order ON business_areas(display_order);

-- 6. 사업 실적 테이블
CREATE TABLE IF NOT EXISTS business_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  achievement_date DATE NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_achievements_date ON business_achievements(achievement_date DESC);
CREATE INDEX IF NOT EXISTS idx_business_achievements_category ON business_achievements(category);

-- 7. 연락처 정보 테이블
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  business_hours TEXT,
  phone_main VARCHAR(50),
  phone_manager VARCHAR(50),
  fax VARCHAR(50),
  kakao_map_url TEXT,
  naver_map_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 연락처 정보는 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS contact_info_single_row ON contact_info ((1));

-- 8. 제품 테이블
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  specs JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 9. 게시글 테이블 (공지사항, Q&A, 견적, 리뷰)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('notice', 'qna', 'quote', 'review')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  category VARCHAR(100),
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);

-- 10. 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

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

CREATE TRIGGER update_company_history_updated_at BEFORE UPDATE ON company_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_areas_updated_at BEFORE UPDATE ON business_areas
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
ALTER TABLE company_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 프로필 정책: 사용자는 자신의 프로필을 읽고 수정할 수 있음
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 관리자 정책: 관리자는 모든 프로필을 볼 수 있음
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid()
    )
  );

-- 관리자 테이블 정책: 사용자는 자신의 레코드를 읽을 수 있음
-- 이렇게 하면 로그인 시 자신의 관리자 여부를 확인할 수 있음
CREATE POLICY "Users can view own administrator record" ON administrators
  FOR SELECT USING (auth.uid() = id);

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
  );
$$;

-- 관리자는 모든 관리자 레코드를 볼 수 있음 (SECURITY DEFINER 함수 사용)
CREATE POLICY "Admins can view all administrators" ON administrators
  FOR SELECT USING (is_admin(auth.uid()));

-- 공개 데이터는 모든 사용자가 읽을 수 있도록 설정
CREATE POLICY "Public read access for prologue_settings" ON prologue_settings
  FOR SELECT USING (true);

CREATE POLICY "Public read access for prologue_carousel_items" ON prologue_carousel_items
  FOR SELECT USING (true);

CREATE POLICY "Public read access for company_info" ON company_info
  FOR SELECT USING (true);

CREATE POLICY "Public read access for company_history" ON company_history
  FOR SELECT USING (true);

CREATE POLICY "Public read access for business_areas" ON business_areas
  FOR SELECT USING (true);

CREATE POLICY "Public read access for business_achievements" ON business_achievements
  FOR SELECT USING (true);

CREATE POLICY "Public read access for contact_info" ON contact_info
  FOR SELECT USING (true);

CREATE POLICY "Public read access for published products" ON products
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read access for published posts" ON posts
  FOR SELECT USING (status = 'published');

-- 작성자는 자신의 글을 볼 수 있음
CREATE POLICY "Authors can view own posts" ON posts
  FOR SELECT USING (auth.uid() = author_id);

-- 댓글 정책: 공개된 게시글의 댓글은 모두 볼 수 있음
CREATE POLICY "Public read access for comments on published posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.status = 'published'
    )
  );

-- 작성자는 자신이 작성한 게시글의 댓글을 볼 수 있음
CREATE POLICY "Authors can view comments on own posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.author_id = auth.uid()
    )
  );

-- 관리자는 모든 댓글을 볼 수 있음
CREATE POLICY "Admins can view all comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid()
    )
  );

-- 관리자만 수정/삭제 가능하도록 설정 (시스템 관리자만)
CREATE POLICY "System admin write access for prologue_settings" ON prologue_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

CREATE POLICY "System admin write access for prologue_carousel_items" ON prologue_carousel_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

CREATE POLICY "System admin write access for company_info" ON company_info
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

CREATE POLICY "System admin write access for company_history" ON company_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

CREATE POLICY "System admin write access for business_areas" ON business_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

CREATE POLICY "System admin write access for business_achievements" ON business_achievements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

CREATE POLICY "System admin write access for contact_info" ON contact_info
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

CREATE POLICY "System admin write access for products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

-- 게시글 작성: 로그인한 사용자는 작성 가능
CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 게시글 수정/삭제: 작성자 본인 또는 시스템 관리자만 가능
CREATE POLICY "Authors and admins can update posts" ON posts
  FOR UPDATE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

CREATE POLICY "Authors and admins can delete posts" ON posts
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
  );

-- 댓글 작성: 로그인한 사용자는 공개된 게시글에 댓글 작성 가능
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.status = 'published'
    )
  );

-- 댓글 수정: 본인만 수정 가능
CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

-- 댓글 삭제: 본인 또는 관리자만 삭제 가능
CREATE POLICY "Authors and admins can delete comments" ON comments
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM administrators 
      WHERE administrators.id = auth.uid() 
      AND administrators.role = 'system'
    )
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

