-- ============================================================================
-- RLS (Row Level Security) 정책 정의
-- ============================================================================

-- ============================================================================
-- 1. 모든 테이블 RLS 활성화
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE board_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

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
-- 4. pages 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for published pages" ON pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admin can view all pages" ON pages
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admin write access for pages" ON pages
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for pages" ON pages
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for pages" ON pages
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

-- ============================================================================
-- 9. product_categories 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for product_categories" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for product_categories" ON product_categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for product_categories" ON product_categories
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

-- ============================================================================
-- 12. board_categories 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for board_categories" ON board_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for board_categories" ON board_categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for board_categories" ON board_categories
  FOR UPDATE USING (is_admin(auth.uid()));

-- ============================================================================
-- 13. posts 테이블 RLS 정책
-- ============================================================================

-- 새로운 SELECT 정책: visibility='owner'인 게시판은 본인 게시물만 조회 가능
CREATE POLICY "Public read access for published posts" ON posts
  FOR SELECT USING (
    deleted_at IS NULL 
    AND status = 'published'
    AND (
      -- 관리자는 모든 게시물 조회 가능
      is_admin(auth.uid()) OR
      -- visibility가 'owner'가 아닌 게시판의 게시물은 모두 조회 가능
      NOT EXISTS (
        SELECT 1 FROM boards 
        WHERE boards.id = posts.board_id 
        AND boards.visibility = 'owner'::visible_type
        AND boards.deleted_at IS NULL
      ) OR
      -- visibility가 'owner'인 게시판의 경우 본인 게시물만 조회 가능
      (
        EXISTS (
          SELECT 1 FROM boards 
          WHERE boards.id = posts.board_id 
          AND boards.visibility = 'owner'::visible_type
          AND boards.deleted_at IS NULL
        )
        AND auth.uid() = posts.author_id
      )
    )
  );

-- 작성자는 본인 게시물 조회 가능 (draft 포함)
CREATE POLICY "Authors can view own posts" ON posts
  FOR SELECT USING (
    auth.uid() = author_id
  );

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 개선된 UPDATE 정책: 
-- - 기존 구조 유지 (auth.uid() = author_id OR is_admin(auth.uid()))
-- - deleted_at이 NULL인 경우에만 수정 가능 (이미 삭제된 게시글 수정 방지)
CREATE POLICY "Authors and admins can update posts" ON posts
  FOR UPDATE USING (
    -- 삭제되지 않은 게시글만 수정 가능
    deleted_at IS NULL
    AND (
      auth.uid() = author_id OR
      is_admin(auth.uid())
    )
  )
  WITH CHECK (
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

-- ============================================================================
-- 15. comments 테이블 RLS 정책
-- ============================================================================

CREATE POLICY "Public read access for comments on published posts" ON comments
  FOR SELECT USING (
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

CREATE POLICY "Authors and admins can update and soft delete own comments" ON comments
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
-- 19. board_policies 테이블 RLS 정책
-- ============================================================================

-- 모든 사용자(인증/비인증 포함)가 board_policies 조회 가능
CREATE POLICY "Public read access for board_policies" ON board_policies
  FOR SELECT USING (true);

-- 관리자만 board_policies 수정 가능
CREATE POLICY "Admins can manage board_policies" ON board_policies
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================================================
-- 20. activity_logs 테이블 RLS 정책
-- ============================================================================

-- 모든 사용자는 자신의 로그만 조회 가능
CREATE POLICY "Users can view their own logs"
  ON activity_logs
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- 관리자는 모든 로그 조회 가능
CREATE POLICY "Admins can view all logs"
  ON activity_logs
  FOR SELECT
  USING (
    is_admin(auth.uid())
  );

-- 시스템은 모든 로그 삽입 가능 (서버 사이드에서 로그 기록)
CREATE POLICY "System can insert all logs"
  ON activity_logs
  FOR INSERT
  WITH CHECK (true);

-- 관리자만 로그 삭제 가능 (로그 보관 정책에 따라)
CREATE POLICY "Admins can delete logs"
  ON activity_logs
  FOR DELETE
  USING (
    is_admin(auth.uid())
  );

-- ============================================================================
-- 21. Storage 버킷 RLS 정책
-- ============================================================================

-- 22-1. editor-images 버킷 정책
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

-- 22-2. post-files 버킷 정책
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

-- 22-3. prologue-carousel 버킷 정책
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

