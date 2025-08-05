-- Fix Board Owner Issue
-- Run this in your Supabase SQL editor

-- First, let's check what boards you should own
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

-- Check if you're in board_members for boards you created
SELECT 
  b.id as board_id,
  b.title,
  b.created_by,
  bm.user_id as member_user_id,
  bm.role as member_role,
  CASE 
    WHEN b.created_by = auth.uid() THEN 'SHOULD BE OWNER'
    WHEN bm.user_id = auth.uid() THEN 'IS MEMBER'
    ELSE 'NOT MEMBER'
  END as status
FROM boards b
LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_id = auth.uid()
WHERE b.created_by = auth.uid()
ORDER BY b.created_at DESC;

-- Add yourself as owner for boards you created but aren't a member of
INSERT INTO board_members (board_id, user_id, role)
SELECT 
  b.id as board_id,
  auth.uid() as user_id,
  'owner' as role
FROM boards b
WHERE b.created_by = auth.uid()
AND NOT EXISTS (
  SELECT 1 FROM board_members bm 
  WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
);

-- Verify the fix
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