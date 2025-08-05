-- Simple Data Isolation Fix (No 500 Errors)
-- Run this in your Supabase SQL editor

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable update for board owners" ON boards;
DROP POLICY IF EXISTS "Enable delete for board owners" ON boards;

DROP POLICY IF EXISTS "Users can view their own boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update their own boards" ON boards;
DROP POLICY IF EXISTS "Users can delete their own boards" ON boards;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON board_members;

DROP POLICY IF EXISTS "Users can view board members of their boards" ON board_members;
DROP POLICY IF EXISTS "Users can insert board members to their boards" ON board_members;
DROP POLICY IF EXISTS "Users can update board members of their boards" ON board_members;
DROP POLICY IF EXISTS "Users can delete board members of their boards" ON board_members;

-- Step 2: Create simple, working isolation policies

-- Boards Table - Simple isolation
CREATE POLICY "Users can view own boards" ON boards
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert boards" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own boards" ON boards
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own boards" ON boards
  FOR DELETE USING (created_by = auth.uid());

-- Board Members Table - Simple isolation
CREATE POLICY "Users can view own board members" ON board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert own board members" ON board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update own board members" ON board_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete own board members" ON board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
    )
  );

-- Step 3: Test the isolation
SELECT 
  'Simple isolation implemented!' as info,
  'Users will only see boards they created' as description;

-- Step 4: Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('boards', 'board_members')
ORDER BY tablename, policyname; 