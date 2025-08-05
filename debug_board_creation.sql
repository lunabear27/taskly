-- Debug Board Creation
-- Run this in your Supabase SQL editor to test board creation

-- First, let's temporarily disable RLS to test if board creation works
ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;

-- Test if we can insert a board manually
INSERT INTO boards (title, description, created_by, is_public) 
VALUES ('Test Board', 'Test Description', auth.uid(), false)
RETURNING id, title, created_by;

-- Check if the board was created
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  created_at
FROM boards 
WHERE created_by = auth.uid()
ORDER BY created_at DESC;

-- Re-enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Test the current user
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Test what boards the current user can see
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