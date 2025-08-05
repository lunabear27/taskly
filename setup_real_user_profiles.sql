-- Set up real user profiles with actual email addresses
-- This script will create user profiles for board members with their real emails

-- First, let's see what users we have in auth.users (this might be limited due to RLS)
-- We'll need to create a function to get user data safely

-- Create a function to get user email by user_id
CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Try to get email from auth.users (this might not work due to RLS)
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_uuid;
  
  RETURN user_email;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now let's create user profiles for board members with real emails
INSERT INTO user_profiles (id, email, username, created_at)
SELECT 
  bm.user_id,
  COALESCE(
    get_user_email(bm.user_id::UUID),
    CONCAT('user.', SUBSTRING(bm.user_id, 1, 8), '@example.com')
  ) as email,
  COALESCE(
    SPLIT_PART(get_user_email(bm.user_id::UUID), '@', 1),
    CONCAT('User ', SUBSTRING(bm.user_id, 1, 8))
  ) as username,
  NOW() as created_at
FROM board_members bm
LEFT JOIN user_profiles up ON bm.user_id = up.id
WHERE up.id IS NULL 
  AND NOT bm.user_id LIKE 'invited_%'
  AND bm.user_id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username;

-- Show the results
SELECT 
  'User Profiles Setup' as status,
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
DROP FUNCTION IF EXISTS get_user_email(UUID); 