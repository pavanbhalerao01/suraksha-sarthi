-- Check actual UserRole enum values in database
SELECT enumlabel 
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'UserRole'
ORDER BY e.oid;