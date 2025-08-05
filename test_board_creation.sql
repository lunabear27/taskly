-- Test Board Creation
-- Run this in your Supabase SQL editor

-- Check current user
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Try to create a test board
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Test Board Creation', 'Testing if board creation works', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Check if the board was created and is visible
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  CASE 
    WHEN created_by = auth.uid() THEN 'OWNER'
    WHEN is_public = true THEN 'PUBLIC'
    WHEN EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    ) THEN 'MEMBER'
    ELSE 'NO ACCESS'
  END as access_type
FROM boards 
WHERE title = 'Test Board Creation'
ORDER BY created_at DESC; 