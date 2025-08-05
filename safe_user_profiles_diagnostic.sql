-- SAFE DIAGNOSTIC SCRIPT - READ ONLY
-- This script will only read data and show us what's in the user_profiles table
-- It will NOT make any changes to your database

-- First, let's see the structure of user_profiles table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check what's currently in user_profiles
SELECT 
  'Current user_profiles' as info,
  COUNT(*) as total_count,
  COUNT(email) as emails_count,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as valid_emails,
  COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as missing_emails
FROM user_profiles;

-- Show sample data to understand the current state
SELECT 
  id,
  user_id,
  email,
  username,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- Check for users with missing email data
SELECT 
  'Users with missing emails' as info,
  COUNT(*) as count
FROM user_profiles 
WHERE email IS NULL OR email = '';

-- Show users that would be affected by an update
SELECT 
  up.id,
  up.user_id,
  up.email as current_email,
  au.email as auth_email,
  CASE 
    WHEN up.email IS NULL OR up.email = '' THEN 'MISSING'
    WHEN up.email = au.email THEN 'MATCH'
    ELSE 'DIFFERENT'
  END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.email IS NULL OR up.email = ''
LIMIT 10;

-- Check if there are any potential conflicts
SELECT 
  'Potential conflicts' as info,
  COUNT(*) as count
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.email IS NOT NULL 
  AND up.email != '' 
  AND up.email != au.email; 