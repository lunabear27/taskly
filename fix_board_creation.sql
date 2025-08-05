-- Fix Board Creation with Trigger
-- Run this in your Supabase SQL editor

-- First, let's fix any boards with null created_by
UPDATE boards 
SET created_by = auth.uid() 
WHERE created_by IS NULL;

-- Create a trigger function to set created_by automatically
CREATE OR REPLACE FUNCTION set_board_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- If created_by is null, set it to the current user
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_board_created_by_trigger ON boards;
CREATE TRIGGER set_board_created_by_trigger
  BEFORE INSERT ON boards
  FOR EACH ROW
  EXECUTE FUNCTION set_board_created_by();

-- Test the trigger
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Trigger Test Board', 'Testing the trigger', NULL, false)
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
WHERE title = 'Trigger Test Board'
ORDER BY created_at DESC; 