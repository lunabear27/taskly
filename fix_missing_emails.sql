-- Check which user profiles are missing emails
SELECT 
  up.user_id,
  up.username,
  up.display_name,
  up.email as profile_email,
  au.email as auth_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.email IS NULL;

-- Update all user profiles with emails from auth.users
UPDATE user_profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE user_profiles.user_id = auth.users.id 
AND user_profiles.email IS NULL;

-- Verify the update worked
SELECT 
  user_id,
  username,
  display_name,
  email
FROM user_profiles
ORDER BY created_at DESC; 