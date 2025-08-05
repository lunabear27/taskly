-- Create user profiles for users who don't have them
-- This script will add missing users to the user_profiles table

-- First, let's see which users are missing from user_profiles
SELECT 
  'Missing Users' as status,
  COUNT(DISTINCT bm.user_id) as count
FROM board_members bm
LEFT JOIN user_profiles up ON bm.user_id = up.id
WHERE up.id IS NULL AND NOT bm.user_id LIKE 'invited_%';

-- Show the specific missing users
SELECT 
  bm.user_id,
  bm.role,
  b.title as board_title
FROM board_members bm
JOIN boards b ON bm.board_id = b.id
LEFT JOIN user_profiles up ON bm.user_id = up.id
WHERE up.id IS NULL AND NOT bm.user_id LIKE 'invited_%';

-- Create user profiles for missing users
-- Note: This creates placeholder profiles. In a real app, you'd want to get actual user data from auth.users
INSERT INTO user_profiles (id, email, username, created_at)
SELECT 
  bm.user_id,
  CONCAT('user.', SUBSTRING(bm.user_id, 1, 8), '@example.com') as email,
  CONCAT('User ', SUBSTRING(bm.user_id, 1, 8)) as username,
  NOW() as created_at
FROM board_members bm
LEFT JOIN user_profiles up ON bm.user_id = up.id
WHERE up.id IS NULL 
  AND NOT bm.user_id LIKE 'invited_%'
  AND bm.user_id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify the fix
SELECT 
  'User Profiles Created' as status,
  COUNT(*) as count
FROM user_profiles;

-- Show updated board members with user data
SELECT 
  bm.id,
  bm.board_id,
  bm.user_id,
  bm.role,
  b.title as board_title,
  up.email as user_email,
  up.username as user_username
FROM board_members bm
JOIN boards b ON bm.board_id = b.id
LEFT JOIN user_profiles up ON bm.user_id = up.id
WHERE bm.board_id = '09b5a92d-11ea-45b4-a4ff-99e3684c9cbd'; 