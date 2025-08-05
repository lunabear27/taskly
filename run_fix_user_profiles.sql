-- Run this in your Supabase SQL editor to fix user_profiles
-- This will ensure we have proper email data for accurate profile pictures

-- First, let's see what's in user_profiles
SELECT 
  'Current user_profiles' as info,
  COUNT(*) as total_count,
  COUNT(email) as emails_count
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

-- Update user_profiles with real email data from auth.users
-- This will help with profile picture accuracy
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
  COUNT(email) as emails_count
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