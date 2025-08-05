-- Fix user_profiles table to ensure we have proper email data
-- This will help us get accurate profile pictures

-- First, let's see what's in user_profiles
SELECT 
  'Current user_profiles' as info,
  COUNT(*) as total_count,
  COUNT(email) as emails_count,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as valid_emails
FROM user_profiles;

-- Show sample data
SELECT 
  id,
  user_id,
  email,
  username,
  created_at
FROM user_profiles
LIMIT 10;

-- Update user_profiles to ensure all users have proper email data
-- This will help with profile picture accuracy

-- First, let's see which users are missing email data
SELECT 
  up.id,
  up.user_id,
  up.email,
  au.email as auth_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.email IS NULL OR up.email = '';

-- Update user_profiles with real email data from auth.users
UPDATE user_profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE user_profiles.user_id = auth_users.id
AND (user_profiles.email IS NULL OR user_profiles.email = '');

-- Also update username if it's missing
UPDATE user_profiles 
SET username = COALESCE(
  user_profiles.username,
  SPLIT_PART(auth_users.email, '@', 1)
)
FROM auth.users auth_users
WHERE user_profiles.user_id = auth_users.id
AND user_profiles.username IS NULL;

-- Verify the fix
SELECT 
  'After fix - user_profiles' as info,
  COUNT(*) as total_count,
  COUNT(email) as emails_count,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as valid_emails
FROM user_profiles;

-- Show updated sample data
SELECT 
  id,
  user_id,
  email,
  username,
  created_at
FROM user_profiles
LIMIT 10; 