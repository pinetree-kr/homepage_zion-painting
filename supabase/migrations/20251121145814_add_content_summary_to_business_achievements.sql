-- business_achievements 테이블에 content_summary 필드 추가

-- content_summary 컬럼 추가 (최대 50자)
ALTER TABLE business_achievements 
  ADD COLUMN IF NOT EXISTS content_summary VARCHAR(50);

-- 기존 데이터에 content_summary 생성 (HTML 태그 제거 후 50자로 제한)
-- PostgreSQL의 regexp_replace를 사용하여 HTML 태그 제거
UPDATE business_achievements
SET content_summary = LEFT(
  TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  REGEXP_REPLACE(
                    REGEXP_REPLACE(content, '<script[^>]*>.*?</script>', '', 'gi'),
                    '<style[^>]*>.*?</style>', '', 'gi'
                  ),
                  '<[^>]+>', '', 'g'
                ),
                '&nbsp;', ' ', 'g'
              ),
              '&amp;', '&', 'g'
            ),
            '&lt;', '<', 'g'
          ),
          '&gt;', '>', 'g'
        ),
        '&quot;', '"', 'g'
      ),
      '&#39;', '''', 'g'
    )
  ),
  50
)
WHERE content_summary IS NULL OR content_summary = '';

-- content_summary 인덱스 생성 (선택적, 검색이 필요한 경우)
-- CREATE INDEX IF NOT EXISTS idx_business_achievements_content_summary ON business_achievements(content_summary);

