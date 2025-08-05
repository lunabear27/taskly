-- Add user_email column to board_members table
-- This will store the email of each board member for better display

-- Add the column
ALTER TABLE board_members ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Update existing records with current user emails
-- This will only work for the current user's own memberships
UPDATE board_members 
SET user_email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = board_members.user_id
)
WHERE user_email IS NULL; 