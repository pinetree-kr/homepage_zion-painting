-- 게시물 첨부 파일을 위한 Storage 버킷 생성 및 정책 설정

-- Storage 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-files',
  'post-files',
  true, -- 공개 버킷 (파일 URL 직접 접근 가능)
  1048576, -- 1MB 제한 (현재 설정과 동일)
  ARRAY[
    -- 이미지
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp', 
    'image/gif',
    -- 문서
    'application/pdf',
    'application/msword', -- .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- .docx
    'application/vnd.ms-excel', -- .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', -- .xlsx
    'application/vnd.ms-powerpoint', -- .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- .pptx
    'text/plain', -- .txt
    'text/csv', -- .csv
    'application/zip', -- .zip
    'application/x-zip-compressed' -- .zip (대체)
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책: 모든 사용자가 읽기 가능 (공개 버킷)
CREATE POLICY "Public read access for post files"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-files');

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Admin upload access for post files" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access for post files" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for post files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access for post files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for post files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for post files" ON storage.objects;

-- Storage 정책: 관리자 및 인증된 사용자 업로드 가능
CREATE POLICY "Authenticated upload access for post files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-files' AND
  auth.uid() IS NOT NULL
);

-- Storage 정책: 관리자 및 인증된 사용자 업데이트 가능
CREATE POLICY "Authenticated update access for post files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-files' AND
  auth.uid() IS NOT NULL
);

-- Storage 정책: 관리자 및 인증된 사용자 삭제 가능
CREATE POLICY "Authenticated delete access for post files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-files' AND
  auth.uid() IS NOT NULL
);

