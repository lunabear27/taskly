-- Alternative Fix - Handle Auth UID Issue
-- Run this in your Supabase SQL editor

-- First, let's check what auth.uid() returns in different contexts
SELECT 
  'Auth UID in SELECT:' as info,
  auth.uid() as user_id;

-- Let's try a different approach - use a function that gets the user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 
  'Function result:' as info,
  get_current_user_id() as user_id;

-- Create a better trigger function
CREATE OR REPLACE FUNCTION set_board_created_by_v2()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Try to get the current user ID
  current_user_id := get_current_user_id();
  
  -- If we got a valid user ID and created_by is null, set it
  IF current_user_id IS NOT NULL AND NEW.created_by IS NULL THEN
    NEW.created_by := current_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger and create a new one
DROP TRIGGER IF EXISTS set_board_created_by_trigger ON boards;
CREATE TRIGGER set_board_created_by_trigger_v2
  BEFORE INSERT ON boards
  FOR EACH ROW
  EXECUTE FUNCTION set_board_created_by_v2();

-- Test the new trigger
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Alternative Test Board', 'Testing alternative fix', NULL, false)
RETURNING id, title, created_by, is_public;

-- Check if it worked
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  CASE 
    WHEN created_by = auth.uid() THEN 'OWNER'
    WHEN created_by IS NULL THEN 'NULL CREATED_BY'
    WHEN is_public = true THEN 'PUBLIC'
    WHEN EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    ) THEN 'MEMBER'
    ELSE 'NO ACCESS'
  END as access_type
FROM boards 
WHERE title = 'Alternative Test Board'
ORDER BY created_at DESC; 