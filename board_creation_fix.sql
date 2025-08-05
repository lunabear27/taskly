-- Board Creation Fix - Make Board Creation Work
-- Run this in your Supabase SQL editor

-- Drop existing board policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;

-- Create completely permissive board policies (temporary)
CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert boards" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update boards" ON boards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete boards" ON boards
  FOR DELETE USING (auth.role() = 'authenticated'); 