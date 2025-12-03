-- Remove allow_product_link column from boards table
ALTER TABLE boards DROP COLUMN IF EXISTS allow_product_link;

