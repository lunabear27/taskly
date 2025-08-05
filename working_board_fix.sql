-- Working Board Fix - Simple and Functional
-- Run this in your Supabase SQL editor

-- Drop existing board policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;

-- Create simple, working board policies
CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (
    is_public = true OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert boards" ON boards
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update boards" ON boards
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete boards" ON boards
  FOR DELETE USING (created_by = auth.uid());

-- Also fix board_members policies to ensure they work
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