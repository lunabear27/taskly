-- Test Data Isolation Between Users
-- Run this in your Supabase SQL editor

-- Step 1: Create a board for user 1 (mjdialogo1@gmail.com)
INSERT INTO boards (title, description, created_by, is_public)
SELECT 
  'User 1 Board', 
  'This board belongs to user 1', 
  id, 
  false
FROM auth.users 
WHERE email = 'mjdialogo1@gmail.com'
RETURNING id, title, created_by, is_public;

-- Step 2: Create a board for user 2 (mjdialogo2@gmail.com)
INSERT INTO boards (title, description, created_by, is_public)
SELECT 
  'User 2 Board', 
  'This board belongs to user 2', 
  id, 
  false
FROM auth.users 
WHERE email = 'mjdialogo2@gmail.com'
RETURNING id, title, created_by, is_public;

-- Step 3: Check what boards exist
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  (SELECT email FROM auth.users WHERE id = boards.created_by) as owner_email
FROM boards 
ORDER BY created_at DESC;

-- Step 4: Show current user
SELECT 
  'Current user:' as info,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email;

-- Step 5: Check what boards current user can see
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  CASE 
    WHEN created_by = auth.uid() THEN 'OWNER'
    WHEN EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    ) THEN 'MEMBER'
    ELSE 'NO ACCESS'
  END as access_type
FROM boards 
ORDER BY created_at DESC; 