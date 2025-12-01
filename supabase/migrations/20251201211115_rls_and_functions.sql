-- RLS (Row Level Security) 및 함수 설정
-- 모든 테이블의 RLS 정책 및 함수

-- ============================================================================
-- 0. 필수 함수 생성
-- ============================================================================

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
  );
$$;

-- 사용자 가입 시 프로필 자동 생성 트리거 함수
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

-- 사용자 가입 시 프로필 자동 생성 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 1. 모든 테이블 RLS 활성화
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE prologue_carousel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. profiles 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- ============================================================================
-- 3. administrators 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Users can view own administrator record" ON administrators
  FOR SELECT USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Admins can view all administrators" ON administrators
  FOR SELECT USING (is_admin(auth.uid()));

-- ============================================================================
-- 4. prologue_carousel_items 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for prologue_carousel_items" ON prologue_carousel_items
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for prologue_carousel_items" ON prologue_carousel_items
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for prologue_carousel_items" ON prologue_carousel_items
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for prologue_carousel_items" ON prologue_carousel_items
  FOR DELETE USING (is_admin(auth.uid()));

-- ============================================================================
-- 5. company_info 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for company_info" ON company_info
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for company_info" ON company_info
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for company_info" ON company_info
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for company_info" ON company_info
  FOR DELETE USING (is_admin(auth.uid()));

-- ============================================================================
-- 6. business_info 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for business_info" ON business_info
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for business_info" ON business_info
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for business_info" ON business_info
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for business_info" ON business_info
  FOR DELETE USING (is_admin(auth.uid()));

-- ============================================================================
-- 7. business_categories 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for business_categories" ON business_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for business_categories" ON business_categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for business_categories" ON business_categories
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for business_categories" ON business_categories
  FOR DELETE USING (is_admin(auth.uid()));

-- ============================================================================
-- 8. business_achievements 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Admin can view all business_achievements" ON business_achievements
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Public read access for business_achievements" ON business_achievements
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Admin write access for business_achievements" ON business_achievements
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for business_achievements" ON business_achievements
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for business_achievements" ON business_achievements
  FOR UPDATE USING (is_admin(auth.uid()));

-- ============================================================================
-- 9. product_categories 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for product_categories" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for product_categories" ON product_categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for product_categories" ON product_categories
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin soft delete access for product_categories" ON product_categories
  FOR UPDATE USING (is_admin(auth.uid()));

-- ============================================================================
-- 10. products 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for published products" ON products
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Admin can view all products" ON products
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admin write access for products" ON products
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for products" ON products
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for products" ON products
  FOR UPDATE USING (is_admin(auth.uid()));

-- ============================================================================
-- 11. boards 테이블 RLS 정책
-- ============================================================================

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

-- ============================================================================
-- 12. board_categories 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for board_categories" ON board_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for board_categories" ON board_categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for board_categories" ON board_categories
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin soft delete access for board_categories" ON board_categories
  FOR UPDATE USING (is_admin(auth.uid()));

-- ============================================================================
-- 13. posts 테이블 RLS 정책
-- ============================================================================

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

-- ============================================================================
-- 14. post_files 테이블 RLS 정책
-- ============================================================================

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

-- ============================================================================
-- 15. comments 테이블 RLS 정책
-- ============================================================================

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
    )
  );

CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete comments" ON comments
  FOR UPDATE USING (
    auth.uid() = author_id OR
    is_admin(auth.uid())
  );

-- ============================================================================
-- 16. product_reviews 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for published product_reviews" ON product_reviews
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_reviews.post_id 
      AND posts.status = 'published'
      AND posts.deleted_at IS NULL
    )
  );

CREATE POLICY "Authors can view own product_reviews" ON product_reviews
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_reviews.post_id 
      AND posts.author_id = auth.uid()
      AND posts.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can view all product_reviews" ON product_reviews
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Authors and admins can create product_reviews" ON product_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_reviews.post_id 
      AND (
        posts.author_id = auth.uid() OR
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Authors and admins can update product_reviews" ON product_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_reviews.post_id 
      AND (
        posts.author_id = auth.uid() OR
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Authors and admins can delete product_reviews" ON product_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_reviews.post_id 
      AND (
        posts.author_id = auth.uid() OR
        is_admin(auth.uid())
      )
    )
  );

-- ============================================================================
-- 17. product_inquiries 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for published product_inquiries" ON product_inquiries
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_inquiries.post_id 
      AND posts.status = 'published'
      AND posts.deleted_at IS NULL
    )
  );

CREATE POLICY "Authors can view own product_inquiries" ON product_inquiries
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_inquiries.post_id 
      AND posts.author_id = auth.uid()
      AND posts.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can view all product_inquiries" ON product_inquiries
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Authors and admins can create product_inquiries" ON product_inquiries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_inquiries.post_id 
      AND (
        posts.author_id = auth.uid() OR
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Authors and admins can update product_inquiries" ON product_inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_inquiries.post_id 
      AND (
        posts.author_id = auth.uid() OR
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Authors and admins can delete product_inquiries" ON product_inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = product_inquiries.post_id 
      AND (
        posts.author_id = auth.uid() OR
        is_admin(auth.uid())
      )
    )
  );

-- ============================================================================
-- 18. site_settings 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for site_settings" ON site_settings
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Admin write access for site_settings" ON site_settings
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for site_settings" ON site_settings
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for site_settings" ON site_settings
  FOR DELETE USING (is_admin(auth.uid()));

-- ============================================================================
-- 19. Storage 버킷 RLS 정책
-- ============================================================================

-- 19-1. editor-images 버킷 정책
CREATE POLICY "Public read access for editor images"
ON storage.objects FOR SELECT
USING (bucket_id = 'editor-images');

CREATE POLICY "Admin upload access for editor images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'editor-images' AND
  is_admin(auth.uid())
);

CREATE POLICY "Admin update access for editor images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'editor-images' AND
  is_admin(auth.uid())
);

CREATE POLICY "Admin delete access for editor images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'editor-images' AND
  is_admin(auth.uid())
);

-- 19-2. post-files 버킷 정책
CREATE POLICY "Public read access for post files"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-files');

CREATE POLICY "Authenticated upload access for post files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated update access for post files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated delete access for post files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-files' AND
  auth.uid() IS NOT NULL
);

-- 19-3. prologue-carousel 버킷 정책
CREATE POLICY "Public read access for prologue carousel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'prologue-carousel');

CREATE POLICY "Admin upload access for prologue carousel images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prologue-carousel' AND
  is_admin(auth.uid())
);

CREATE POLICY "Admin update access for prologue carousel images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'prologue-carousel' AND
  is_admin(auth.uid())
);

CREATE POLICY "Admin delete access for prologue carousel images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prologue-carousel' AND
  is_admin(auth.uid())
);
