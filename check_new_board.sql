-- Check New Board
-- Run this in your Supabase SQL editor

-- Check current user ID
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Check the most recently created board
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  created_at,
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
LIMIT 5; 