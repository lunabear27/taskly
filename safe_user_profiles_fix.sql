-- SAFE UPDATE SCRIPT - Only updates missing data
-- This script is designed to be safe and only fill in missing email data
-- It includes safeguards to prevent data loss

-- STEP 1: First run the diagnostic to see what needs to be fixed
-- (Run the safe_user_profiles_diagnostic.sql first)

-- STEP 2: Create a backup of current data (optional but recommended)
-- This creates a temporary table with current data
CREATE TEMP TABLE user_profiles_backup AS 
SELECT * FROM user_profiles;

-- STEP 3: Only update users with missing email data
-- This is the SAFE update that only fills in missing emails
UPDATE user_profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE user_profiles.user_id = auth_users.id
  AND (user_profiles.email IS NULL OR user_profiles.email = '')
  AND auth_users.email IS NOT NULL;

-- STEP 4: Only update usernames if they're completely missing
-- This preserves any existing usernames
UPDATE user_profiles 
SET username = SPLIT_PART(auth_users.email, '@', 1)
FROM auth.users auth_users
WHERE user_profiles.user_id = auth_users.id
  AND user_profiles.username IS NULL
  AND auth_users.email IS NOT NULL;

-- STEP 5: Verify the changes
SELECT 
  'After safe update - user_profiles' as info,
  COUNT(*) as total_count,
  COUNT(email) as emails_count,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as valid_emails,
  COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as missing_emails
FROM user_profiles;

-- STEP 6: Show what was updated
SELECT 
  'Updated records' as info,
  COUNT(*) as count
FROM user_profiles up
JOIN user_profiles_backup upb ON up.id = upb.id
WHERE (up.email != upb.email OR (up.email IS NOT NULL AND upb.email IS NULL))
   OR (up.username != upb.username OR (up.username IS NOT NULL AND upb.username IS NULL));

-- STEP 7: Show sample of updated data
SELECT 
  id,
  user_id,
  email,
  username,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- STEP 8: Clean up the backup table
DROP TABLE user_profiles_backup; 