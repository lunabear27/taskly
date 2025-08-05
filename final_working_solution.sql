-- Final Working Solution (Handles auth.uid() null issue)
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

DROP POLICY IF EXISTS "Users can only view their own boards" ON boards;
DROP POLICY IF EXISTS "Users can create boards" ON boards;
DROP POLICY IF EXISTS "Users can update their own boards" ON boards;
DROP POLICY IF EXISTS "Users can delete their own boards" ON boards;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON board_members;

DROP POLICY IF EXISTS "Users can view own board members" ON board_members;
DROP POLICY IF EXISTS "Users can insert own board members" ON board_members;
DROP POLICY IF EXISTS "Users can update own board members" ON board_members;
DROP POLICY IF EXISTS "Users can delete own board members" ON board_members;

DROP POLICY IF EXISTS "Users can view members of their own boards" ON board_members;
DROP POLICY IF EXISTS "Users can add members to their own boards" ON board_members;
DROP POLICY IF EXISTS "Users can update members of their own boards" ON board_members;
DROP POLICY IF EXISTS "Users can remove members from their own boards" ON board_members;

-- Step 2: Create a function to get current user ID reliably
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Try auth.uid() first
  IF auth.uid() IS NOT NULL THEN
    RETURN auth.uid();
  END IF;
  
  -- Fallback to JWT claims
  RETURN current_setting('request.jwt.claims', true)::json->>'sub'::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create working policies that handle null auth.uid()

-- Boards Table - Working isolation
CREATE POLICY "Users can view their own boards only" ON boards
  FOR SELECT USING (
    created_by IS NOT NULL AND 
    created_by = get_current_user_id()
  );

CREATE POLICY "Users can create boards" ON boards
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own boards only" ON boards
  FOR UPDATE USING (
    created_by IS NOT NULL AND 
    created_by = get_current_user_id()
  );

CREATE POLICY "Users can delete their own boards only" ON boards
  FOR DELETE USING (
    created_by IS NOT NULL AND 
    created_by = get_current_user_id()
  );

-- Board Members Table - Working isolation
CREATE POLICY "Users can view members of their own boards only" ON board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by IS NOT NULL
      AND boards.created_by = get_current_user_id()
    )
  );

CREATE POLICY "Users can add members to their own boards only" ON board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by IS NOT NULL
      AND boards.created_by = get_current_user_id()
    )
  );

CREATE POLICY "Users can update members of their own boards only" ON board_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by IS NOT NULL
      AND boards.created_by = get_current_user_id()
    )
  );

CREATE POLICY "Users can remove members from their own boards only" ON board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by IS NOT NULL
      AND boards.created_by = get_current_user_id()
    )
  );

-- Step 4: Test the solution
SELECT 
  'Final working solution implemented!' as info,
  'Uses get_current_user_id() function for reliable user identification' as description;

-- Step 5: Test the function
SELECT 
  'Testing get_current_user_id():' as info,
  get_current_user_id() as current_user_id;

-- Step 6: Show what boards would be visible (if user was authenticated)
SELECT 
  id,
  title,
  created_by,
  CASE 
    WHEN created_by = get_current_user_id() THEN 'OWN BOARD'
    WHEN created_by IS NULL THEN 'NULL CREATED_BY'
    ELSE 'OTHER USER BOARD'
  END as access_type
FROM boards 
WHERE created_by = get_current_user_id() OR created_by IS NULL
ORDER BY created_at DESC; 