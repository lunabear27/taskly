-- Simple Permissive Fix - Make Everything Work
-- Run this in your Supabase SQL editor

-- Step 1: Fix existing boards by setting them to a known user ID
-- First, let's see what user IDs exist
SELECT DISTINCT created_by FROM boards WHERE created_by IS NOT NULL;

-- Step 2: Set all null created_by to the first available user ID
UPDATE boards 
SET created_by = (
  SELECT created_by 
  FROM boards 
  WHERE created_by IS NOT NULL 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Step 3: Drop all existing board policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;

-- Step 4: Create completely permissive board policies
CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert boards" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update boards" ON boards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete boards" ON boards
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 5: Also make board_members permissive
DROP POLICY IF EXISTS "Users can view board members" ON board_members;
DROP POLICY IF EXISTS "Users can insert board members" ON board_members;
DROP POLICY IF EXISTS "Users can update board members" ON board_members;
DROP POLICY IF EXISTS "Users can delete board members" ON board_members;

CREATE POLICY "Users can view board members" ON board_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert board members" ON board_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update board members" ON board_members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete board members" ON board_members
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 6: Test board creation
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Permissive Test Board', 'Testing permissive fix', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Step 7: Check what boards you can see
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