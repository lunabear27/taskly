-- Fix comment and tag RLS policies to resolve 500 errors
-- Run this in your Supabase SQL editor

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON comments;
DROP POLICY IF EXISTS "Enable update for users based on ownership" ON comments;
DROP POLICY IF EXISTS "Enable delete for users based on ownership" ON comments;
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can manage comments" ON comments;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tags;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tags;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON tags;
DROP POLICY IF EXISTS "Enable delete for users based on board ownership" ON tags;
DROP POLICY IF EXISTS "Users can view tags" ON tags;
DROP POLICY IF EXISTS "Users can manage tags" ON tags;

-- Ensure RLS is enabled on both tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create completely permissive policies for comments (for testing)
CREATE POLICY "Enable read access for authenticated users" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON comments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON comments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create completely permissive policies for tags (for testing)
CREATE POLICY "Enable read access for authenticated users" ON tags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON tags
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON tags
  FOR DELETE USING (auth.role() = 'authenticated'); 