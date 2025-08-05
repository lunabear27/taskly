-- Simple RLS Policies for Testing
-- Run this in your Supabase SQL editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view lists" ON lists;
DROP POLICY IF EXISTS "Users can manage lists" ON lists;
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can manage boards" ON boards;
DROP POLICY IF EXISTS "Users can view cards" ON cards;
DROP POLICY IF EXISTS "Users can manage cards" ON cards;
DROP POLICY IF EXISTS "Users can view tags" ON tags;
DROP POLICY IF EXISTS "Users can manage tags" ON tags;
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can manage comments" ON comments;

-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Simple policies for boards
CREATE POLICY "Enable read access for authenticated users" ON boards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on created_by" ON boards
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Enable delete for users based on created_by" ON boards
  FOR DELETE USING (auth.uid() = created_by);

-- Simple policies for lists
CREATE POLICY "Enable read access for authenticated users" ON lists
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON lists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on board ownership" ON lists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = lists.board_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Enable delete for users based on board ownership" ON lists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = lists.board_id AND created_by = auth.uid()
    )
  );

-- Simple policies for cards
CREATE POLICY "Enable read access for authenticated users" ON cards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on board ownership" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND b.created_by = auth.uid()
    )
  );

CREATE POLICY "Enable delete for users based on board ownership" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND b.created_by = auth.uid()
    )
  );

-- Simple policies for tags - Updated to be more permissive
CREATE POLICY "Enable read access for authenticated users" ON tags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON tags
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for users based on board ownership" ON tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = tags.board_id AND created_by = auth.uid()
    )
  );

-- Simple policies for comments
CREATE POLICY "Enable read access for authenticated users" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on ownership" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on ownership" ON comments
  FOR DELETE USING (auth.uid() = user_id); 