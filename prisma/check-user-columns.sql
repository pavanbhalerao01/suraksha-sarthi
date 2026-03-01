-- Check actual column names in User table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' 
AND table_schema = 'public'
ORDER BY ordinal_position;