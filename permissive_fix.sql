-- Permissive Fix - Make Board Creation Work
-- Run this in your Supabase SQL editor

-- Fix existing boards
UPDATE boards 
SET created_by = auth.uid() 
WHERE created_by IS NULL;

-- Drop existing board policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;

-- Create permissive policies
CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert boards" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update boards" ON boards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete boards" ON boards
  FOR DELETE USING (auth.role() = 'authenticated');

-- Test board creation
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Permissive Test Board', 'Testing permissive fix', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Check what boards you can see
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