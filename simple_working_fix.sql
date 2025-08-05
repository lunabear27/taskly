-- Simple Working Fix
-- Run this in your Supabase SQL editor

-- First, let's fix all existing boards with null created_by
UPDATE boards 
SET created_by = auth.uid() 
WHERE created_by IS NULL;

-- Create a simple trigger that uses a different approach
CREATE OR REPLACE FUNCTION set_board_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Set created_by to the current user if it's null
  IF NEW.created_by IS NULL THEN
    -- Try to get the user ID from the session
    NEW.created_by := current_setting('request.jwt.claims', true)::json->>'sub';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_board_created_by_trigger ON boards;
DROP TRIGGER IF EXISTS set_board_created_by_trigger_v2 ON boards;
CREATE TRIGGER set_board_owner_trigger
  BEFORE INSERT ON boards
  FOR EACH ROW
  EXECUTE FUNCTION set_board_owner();

-- Test the trigger
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Simple Test Board', 'Testing simple fix', NULL, false)
RETURNING id, title, created_by, is_public;

-- Check what boards you can see now
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
ORDER BY created_at DESC
LIMIT 10; 