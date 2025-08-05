-- Test App Creation Final
-- Run this in your Supabase SQL editor

-- Check current user
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Check if we can see all boards (should work with permissive policies)
SELECT 
  id, 
  title, 
  created_by, 
  is_public
FROM boards 
ORDER BY created_at DESC
LIMIT 5;

-- Check if we can insert a board (should work with permissive policies)
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('App Test Final', 'Testing app creation', '34feeaa2-32c3-4faa-ac5f-10d1fe451e88', false)
RETURNING id, title, created_by, is_public;

-- Check if we can add board members (should work with permissive policies)
INSERT INTO board_members (board_id, user_id, role)
SELECT 
  id as board_id,
  '34feeaa2-32c3-4faa-ac5f-10d1fe451e88' as user_id,
  'owner' as role
FROM boards 
WHERE title = 'App Test Final'
AND NOT EXISTS (
  SELECT 1 FROM board_members bm 
  WHERE bm.board_id = boards.id 
  AND bm.user_id = '34feeaa2-32c3-4faa-ac5f-10d1fe451e88'
);

-- Verify the board was created and is accessible
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
WHERE title = 'App Test Final'
ORDER BY created_at DESC; 