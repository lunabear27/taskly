-- Simple Board Fix - No Auth UID Issues
-- Run this in your Supabase SQL editor

-- Drop existing board policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;

-- Create completely permissive board policies (temporary fix)
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
VALUES ('Simple Test Board', 'Testing simple board creation', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Check what boards you can see
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