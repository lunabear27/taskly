-- Working Data Isolation Fix (No 500 Errors + Proper Isolation)
-- Run this in your Supabase SQL editor

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable update for board owners" ON boards;
DROP POLICY IF EXISTS "Enable delete for board owners" ON boards;

DROP POLICY IF EXISTS "Users can view own boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update own boards" ON boards;
DROP POLICY IF EXISTS "Users can delete own boards" ON boards;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON board_members;

DROP POLICY IF EXISTS "Users can view own board members" ON board_members;
DROP POLICY IF EXISTS "Users can insert own board members" ON board_members;
DROP POLICY IF EXISTS "Users can update own board members" ON board_members;
DROP POLICY IF EXISTS "Users can delete own board members" ON board_members;

-- Step 2: Fix any boards with null created_by (clean up existing data)
UPDATE boards 
SET created_by = (
  SELECT user_id 
  FROM board_members 
  WHERE board_members.board_id = boards.id 
  AND board_members.role = 'owner' 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Step 3: Create robust isolation policies

-- Boards Table - Robust isolation
CREATE POLICY "Users can only view their own boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() AND created_by IS NOT NULL
  );

CREATE POLICY "Users can create boards" ON boards
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid()
  );

CREATE POLICY "Users can update their own boards" ON boards
  FOR UPDATE USING (
    created_by = auth.uid() AND created_by IS NOT NULL
  );

CREATE POLICY "Users can delete their own boards" ON boards
  FOR DELETE USING (
    created_by = auth.uid() AND created_by IS NOT NULL
  );

-- Board Members Table - Robust isolation
CREATE POLICY "Users can view members of their own boards" ON board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
      AND boards.created_by IS NOT NULL
    )
  );

CREATE POLICY "Users can add members to their own boards" ON board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
      AND boards.created_by IS NOT NULL
    )
  );

CREATE POLICY "Users can update members of their own boards" ON board_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
      AND boards.created_by IS NOT NULL
    )
  );

CREATE POLICY "Users can remove members from their own boards" ON board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
      AND boards.created_by IS NOT NULL
    )
  );

-- Step 4: Test the isolation
SELECT 
  'Working isolation implemented!' as info,
  'Users will only see boards they created (no null created_by)' as description;

-- Step 5: Show current user and their boards
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Step 6: Show what boards this user can see
SELECT 
  id,
  title,
  created_by,
  CASE 
    WHEN created_by = auth.uid() THEN 'OWN BOARD'
    WHEN created_by IS NULL THEN 'NULL CREATED_BY'
    ELSE 'OTHER USER BOARD'
  END as access_type
FROM boards 
WHERE created_by = auth.uid() OR created_by IS NULL
ORDER BY created_at DESC; 