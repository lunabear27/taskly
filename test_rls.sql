-- Test RLS Policies
-- Run this in your Supabase SQL editor to debug the issue

-- First, let's temporarily disable RLS to see if boards exist
ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;

-- Check if boards exist
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  created_at
FROM boards 
ORDER BY created_at DESC;

-- Check if board members exist
SELECT 
  board_id,
  user_id,
  role,
  created_at
FROM board_members 
ORDER BY created_at DESC;

-- Now let's re-enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Test the current user's access
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