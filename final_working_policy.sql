-- Final Working Policy - Handle Null Created By Properly
-- Run this in your Supabase SQL editor

-- Step 1: Fix existing boards with null created_by
UPDATE boards 
SET created_by = (
  SELECT id FROM auth.users 
  WHERE email = 'mjdialogo1@gmail.com' 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Step 2: Update the boards SELECT policy to be restrictive but handle edge cases
DROP POLICY IF EXISTS "Users can view boards" ON boards;

CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() OR  -- Own boards
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )  -- Boards they're members of
  );

-- Step 3: Test board creation
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Final Test Board', 'Testing final policy', auth.uid(), false)
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
    WHEN EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    ) THEN 'MEMBER'
    ELSE 'NO ACCESS'
  END as access_type
FROM boards 
ORDER BY created_at DESC
LIMIT 5;

-- Step 5: Show current user for reference
SELECT 
  'Current user:' as info,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email; 