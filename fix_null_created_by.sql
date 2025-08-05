-- Fix Null Created By Issue
-- Run this in your Supabase SQL editor

-- Step 1: Update the boards INSERT policy to be more permissive
DROP POLICY IF EXISTS "Users can insert boards" ON boards;

CREATE POLICY "Users can insert boards" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Step 2: Update the boards SELECT policy to handle null created_by
DROP POLICY IF EXISTS "Users can view boards" ON boards;

CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() OR
    created_by IS NULL OR  -- Allow viewing boards with null created_by
    is_public = true OR
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

-- Step 3: Test board creation again
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Test Board After Policy Fix', 'Testing with permissive policies', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Step 4: Check what boards are visible
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
LIMIT 5; 