-- Test App Board Creation
-- Run this in your Supabase SQL editor

-- Check current user
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Check if we can create boards manually
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('App Test Board', 'Testing app board creation', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Add yourself as owner
INSERT INTO board_members (board_id, user_id, role)
SELECT 
  id as board_id,
  auth.uid() as user_id,
  'owner' as role
FROM boards 
WHERE title = 'App Test Board'
AND created_by = auth.uid();

-- Check if the board is visible
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
WHERE title = 'App Test Board'
ORDER BY created_at DESC; 