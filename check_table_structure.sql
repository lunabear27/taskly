-- Check the actual structure of user_profiles table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check if user_profiles uses 'id' or 'user_id' as the primary key
SELECT 
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'user_profiles' AND tc.constraint_type = 'PRIMARY KEY';

-- Show sample data from user_profiles
SELECT * FROM user_profiles LIMIT 5; 