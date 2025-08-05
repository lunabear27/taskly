-- Get real user emails from auth.users and update user_profiles
-- This script will create user profiles with actual email addresses

-- First, let's see what we have in auth.users (this might be limited due to RLS)
-- We'll create a function that can access auth.users with proper permissions

-- Create a function to safely get user emails
CREATE OR REPLACE FUNCTION get_user_emails_for_profiles()
RETURNS TABLE(user_id UUID, email TEXT) AS $$
BEGIN
  -- This function will be called with SECURITY DEFINER to access auth.users
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now let's create user profiles for all users in auth.users
INSERT INTO user_profiles (id, email, username, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    SPLIT_PART(au.email, '@', 1),
    CONCAT('user_', SUBSTRING(au.id::text, 1, 8))
  ) as username,
  NOW() as created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username;

-- Show the results
SELECT 
  'User Profiles Created/Updated' as status,
  COUNT(*) as total_profiles
FROM user_profiles;

-- Show board members with their real emails
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

-- Clean up the function
DROP FUNCTION IF EXISTS get_user_emails_for_profiles(); 