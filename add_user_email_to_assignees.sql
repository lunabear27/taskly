-- Add user_email column to assignees table
ALTER TABLE assignees ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Update existing assignees with emails from auth.users
UPDATE assignees 
SET user_email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = assignees.user_id
)
WHERE user_email IS NULL; 