-- Check User and Fix Boards
-- Run this in your Supabase SQL editor

-- First, let's see what your current user ID is
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Check which boards have null created_by
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  created_at
FROM boards 
WHERE created_by IS NULL
ORDER BY created_at DESC;

-- Fix the boards that have null created_by by setting them to your current user
UPDATE boards 
SET created_by = auth.uid() 
WHERE created_by IS NULL;

-- Now check what boards you should have access to
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