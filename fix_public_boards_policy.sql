-- Fix Public Boards Policy - Only Show Own and Shared Boards
-- Run this in your Supabase SQL editor

-- Update the boards SELECT policy to be more restrictive
DROP POLICY IF EXISTS "Users can view boards" ON boards;

CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() OR  -- Own boards
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )  -- Boards they're members of
  );

-- Test board creation
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Private Test Board', 'Testing private board creation', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Check what boards are visible (should only show own boards)
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  CASE 
    WHEN created_by = auth.uid() THEN 'OWNER'
    WHEN created_by IS NULL THEN 'NULL CREATED_BY'
    WHEN EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    ) THEN 'MEMBER'
    ELSE 'NO ACCESS'
  END as access_type
FROM boards 
ORDER BY created_at DESC
LIMIT 5; 