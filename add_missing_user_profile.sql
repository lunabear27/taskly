-- ADD MISSING USER PROFILE SCRIPT
-- This script will add the missing user profile for the admin account

-- First, let's see what user we need to add a profile for
SELECT 
  'Missing user profile for:' as info,
  '4322ebd8-737a-4646-ac52-e965318f181d' as user_id;

-- Check if this user exists in auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE id = '4322ebd8-737a-4646-ac52-e965318f181d';

-- Add the missing user profile
INSERT INTO user_profiles (user_id, email, username, created_at)
SELECT 
  id as user_id,
  email,
  SPLIT_PART(email, '@', 1) as username,
  NOW() as created_at
FROM auth.users 
WHERE id = '4322ebd8-737a-4646-ac52-e965318f181d'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = auth.users.id
  );

-- Verify the profile was added
SELECT 
  'After adding profile' as info,
  COUNT(*) as total_profiles
FROM user_profiles;

-- Show the new profile
SELECT 
  id,
  user_id,
  email,
  username,
  created_at
FROM user_profiles
WHERE user_id = '4322ebd8-737a-4646-ac52-e965318f181d'; 