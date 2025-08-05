-- Fix Existing Boards
-- Run this in your Supabase SQL editor

-- Check current user ID
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Check what boards you should have access to
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

-- If you want to fix boards that have null created_by, uncomment this:
-- UPDATE boards 
-- SET created_by = auth.uid() 
-- WHERE created_by IS NULL AND id IN (
--   SELECT id FROM boards WHERE created_by IS NULL LIMIT 1
-- ); 