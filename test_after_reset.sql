-- Test After Reset
-- Run this in your Supabase SQL editor

-- Check current user
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Test board creation
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Test Board After Reset', 'Testing board creation after reset', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Test board member creation
INSERT INTO board_members (board_id, user_id, role)
SELECT 
  id as board_id,
  auth.uid() as user_id,
  'owner' as role
FROM boards 
WHERE title = 'Test Board After Reset'
RETURNING board_id, user_id, role;

-- Test what boards you can see
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
ORDER BY created_at DESC; 