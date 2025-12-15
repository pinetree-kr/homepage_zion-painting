-- 마이그레이션: posts 테이블 스키마 변경
-- 1. thumbnail_url과 content_summary를 content_metadata JSONB로 통합
-- 2. post_files 테이블을 posts.files JSONB로 병합

-- Step 1: content_metadata 컬럼 추가
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS content_metadata JSONB DEFAULT '{}'::jsonb;

-- Step 2: files 컬럼 추가
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- Step 3: 기존 thumbnail_url, content_summary, is_secret 데이터를 content_metadata로 마이그레이션
UPDATE posts
SET content_metadata = jsonb_build_object(
  'thumbnail_url', COALESCE(thumbnail_url, NULL),
  'summary', COALESCE(content_summary, ''),
  'is_secret', COALESCE(is_secret, FALSE)
)
WHERE content_metadata = '{}'::jsonb OR content_metadata IS NULL;

-- Step 4: post_files 테이블 데이터를 posts.files로 마이그레이션
-- file_url이 고유 식별자로 충분하므로 id는 제외
UPDATE posts
SET files = (
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'file_url', pf.file_url,
      'file_name', pf.file_name,
      'file_size', pf.file_size,
      'mime_type', pf.mime_type,
      'created_at', pf.created_at,
      'updated_at', pf.updated_at
    )
    ORDER BY pf.created_at ASC
  ), '[]'::jsonb)
  FROM post_files pf
  WHERE pf.post_id = posts.id
)
WHERE EXISTS (SELECT 1 FROM post_files WHERE post_id = posts.id);

-- Step 5: content_metadata에 GIN 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_posts_content_metadata ON posts USING GIN (content_metadata);

-- Step 6: files에 GIN 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_posts_files ON posts USING GIN (files);

-- Step 7: 기존 컬럼 제거 (데이터 마이그레이션 완료 후)
ALTER TABLE posts
DROP COLUMN IF EXISTS thumbnail_url,
DROP COLUMN IF EXISTS content_summary,
DROP COLUMN IF EXISTS is_secret;

-- Step 8: post_files 테이블 삭제 (데이터 마이그레이션 완료 후)
DROP TABLE IF EXISTS post_files CASCADE;
