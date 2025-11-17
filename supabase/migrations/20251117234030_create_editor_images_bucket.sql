-- CKEditor5 에디터 이미지를 위한 Storage 버킷 생성 및 정책 설정

-- Storage 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editor-images',
  'editor-images',
  true, -- 공개 버킷 (이미지 URL 직접 접근 가능)
  10485760, -- 10MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책: 모든 사용자가 읽기 가능 (공개 버킷)
CREATE POLICY "Public read access for editor images"
ON storage.objects FOR SELECT
USING (bucket_id = 'editor-images');

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Admin upload access for editor images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access for editor images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for editor images" ON storage.objects;

-- Storage 정책: 관리자만 업로드 가능 (is_admin 함수 활용)
CREATE POLICY "Admin upload access for editor images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'editor-images' AND
  is_admin(auth.uid())
);

-- Storage 정책: 관리자만 업데이트 가능 (is_admin 함수 활용)
CREATE POLICY "Admin update access for editor images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'editor-images' AND
  is_admin(auth.uid())
);

-- Storage 정책: 관리자만 삭제 가능 (is_admin 함수 활용)
CREATE POLICY "Admin delete access for editor images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'editor-images' AND
  is_admin(auth.uid())
);

