-- Check if User or users table exists and show structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('User', 'users')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;