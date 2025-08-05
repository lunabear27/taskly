-- Check Users in Database
-- Run this in your Supabase SQL editor

-- Check all users in auth.users table
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Check user count
SELECT 
  'Total users:' as info,
  COUNT(*) as count
FROM auth.users;

-- Check if your specific accounts exist
SELECT 
  'mjdialogo1@gmail.com exists:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'mjdialogo1@gmail.com') 
    THEN 'YES' 
    ELSE 'NO' 
  END as exists;

SELECT 
  'mjdialogo2@gmail.com exists:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'mjdialogo2@gmail.com') 
    THEN 'YES' 
    ELSE 'NO' 
  END as exists;

-- Show current user info
SELECT 
  'Current user:' as info,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email; 