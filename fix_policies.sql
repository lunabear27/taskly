-- Fix RLS Policies
-- Run this in your Supabase SQL editor

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable update for users based on created_by" ON boards;
DROP POLICY IF EXISTS "Enable delete for users based on created_by" ON boards;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON lists;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lists;
DROP POLICY IF EXISTS "Enable update for users based on board ownership" ON lists;
DROP POLICY IF EXISTS "Enable delete for users based on board ownership" ON lists;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON cards;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON cards;
DROP POLICY IF EXISTS "Enable update for users based on board ownership" ON cards;
DROP POLICY IF EXISTS "Enable delete for users based on board ownership" ON cards;

-- Also drop the complex policies that might exist
DROP POLICY IF EXISTS "Users can view lists" ON lists;
DROP POLICY IF EXISTS "Users can manage lists" ON lists;
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can manage boards" ON boards;
DROP POLICY IF EXISTS "Users can view cards" ON cards;
DROP POLICY IF EXISTS "Users can manage cards" ON cards;

-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create new simple policies for boards
CREATE POLICY "Enable read access for authenticated users" ON boards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on created_by" ON boards
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Enable delete for users based on created_by" ON boards
  FOR DELETE USING (auth.uid() = created_by);

-- Create new simple policies for lists
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

-- Create new simple policies for cards
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