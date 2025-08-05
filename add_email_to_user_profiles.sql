-- Add email field to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;

-- Create new policy to allow viewing all profiles for display purposes
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

-- Update existing profiles with emails from auth.users
UPDATE user_profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE user_profiles.user_id = auth.users.id 
AND user_profiles.email IS NULL; 