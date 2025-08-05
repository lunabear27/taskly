-- Fix User ID Mismatch
-- Run this in your Supabase SQL editor

-- Step 1: Check your current user ID
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Step 2: Check what user IDs exist in the database
SELECT DISTINCT created_by FROM boards WHERE created_by IS NOT NULL;

-- Step 3: Add yourself as a member of all boards so you can see them
INSERT INTO board_members (board_id, user_id, role)
SELECT 
  b.id as board_id,
  auth.uid() as user_id,
  'owner' as role
FROM boards b
WHERE NOT EXISTS (
  SELECT 1 FROM board_members bm 
  WHERE bm.board_id = b.id AND bm.user_id = auth.uid()
);

-- Step 4: Update all boards to be owned by your current user
UPDATE boards 
SET created_by = auth.uid() 
WHERE created_by IS NOT NULL;

-- Step 5: Test board creation with your current user ID
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('User Fix Test Board', 'Testing user fix', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Step 6: Add yourself as owner for the new board
INSERT INTO board_members (board_id, user_id, role)
SELECT 
  id as board_id,
  auth.uid() as user_id,
  'owner' as role
FROM boards 
WHERE title = 'User Fix Test Board'
AND created_by = auth.uid();

-- Step 7: Check what boards you can see now
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