-- Temporary Permissive Fix - Get App Working
-- Run this in your Supabase SQL editor

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;

DROP POLICY IF EXISTS "Users can view board members" ON board_members;
DROP POLICY IF EXISTS "Users can insert board members" ON board_members;
DROP POLICY IF EXISTS "Users can update board members" ON board_members;
DROP POLICY IF EXISTS "Users can delete board members" ON board_members;

-- Step 2: Create completely permissive policies (temporary)
CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert boards" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update boards" ON boards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete boards" ON boards
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 3: Create permissive board_members policies
CREATE POLICY "Users can view board members" ON board_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert board members" ON board_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update board members" ON board_members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete board members" ON board_members
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 4: Test the policies
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Step 5: Check if we can query boards (should not give 500 error)
SELECT 
  id, 
  title, 
  created_by, 
  is_public
FROM boards 
ORDER BY created_at DESC
LIMIT 5; 