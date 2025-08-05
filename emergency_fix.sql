-- Emergency Fix - Completely Permissive (Temporary)
-- Run this in your Supabase SQL editor to get boards working immediately

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON boards;

DROP POLICY IF EXISTS "Users can view lists" ON lists;
DROP POLICY IF EXISTS "Users can insert lists" ON lists;
DROP POLICY IF EXISTS "Users can update lists" ON lists;
DROP POLICY IF EXISTS "Users can delete lists" ON lists;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON lists;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lists;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON lists;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON lists;

DROP POLICY IF EXISTS "Users can view cards" ON cards;
DROP POLICY IF EXISTS "Users can insert cards" ON cards;
DROP POLICY IF EXISTS "Users can update cards" ON cards;
DROP POLICY IF EXISTS "Users can delete cards" ON cards;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON cards;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON cards;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON cards;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON cards;

DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update comments" ON comments;
DROP POLICY IF EXISTS "Users can delete comments" ON comments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON comments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON comments;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON comments;

DROP POLICY IF EXISTS "Users can view tags" ON tags;
DROP POLICY IF EXISTS "Users can insert tags" ON tags;
DROP POLICY IF EXISTS "Users can update tags" ON tags;
DROP POLICY IF EXISTS "Users can delete tags" ON tags;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tags;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tags;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON tags;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON tags;

DROP POLICY IF EXISTS "Users can view board members" ON board_members;
DROP POLICY IF EXISTS "Users can insert board members" ON board_members;
DROP POLICY IF EXISTS "Users can update board members" ON board_members;
DROP POLICY IF EXISTS "Users can delete board members" ON board_members;

DROP POLICY IF EXISTS "Users can view invitations" ON invitations;
DROP POLICY IF EXISTS "Users can insert invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON invitations;
DROP POLICY IF EXISTS "Users can delete invitations" ON invitations;

DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications" ON notifications;

-- Ensure RLS is enabled
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create completely permissive policies (TEMPORARY - for debugging)
-- Boards
CREATE POLICY "Emergency boards view" ON boards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency boards insert" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Emergency boards update" ON boards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency boards delete" ON boards
  FOR DELETE USING (auth.role() = 'authenticated');

-- Lists
CREATE POLICY "Emergency lists view" ON lists
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency lists insert" ON lists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Emergency lists update" ON lists
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency lists delete" ON lists
  FOR DELETE USING (auth.role() = 'authenticated');

-- Cards
CREATE POLICY "Emergency cards view" ON cards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency cards insert" ON cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Emergency cards update" ON cards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency cards delete" ON cards
  FOR DELETE USING (auth.role() = 'authenticated');

-- Comments
CREATE POLICY "Emergency comments view" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency comments insert" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Emergency comments update" ON comments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency comments delete" ON comments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Tags
CREATE POLICY "Emergency tags view" ON tags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency tags insert" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Emergency tags update" ON tags
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency tags delete" ON tags
  FOR DELETE USING (auth.role() = 'authenticated');

-- Board Members
CREATE POLICY "Emergency board_members view" ON board_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency board_members insert" ON board_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Emergency board_members update" ON board_members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency board_members delete" ON board_members
  FOR DELETE USING (auth.role() = 'authenticated');

-- Invitations
CREATE POLICY "Emergency invitations view" ON invitations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency invitations insert" ON invitations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Emergency invitations update" ON invitations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency invitations delete" ON invitations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Notifications
CREATE POLICY "Emergency notifications view" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency notifications insert" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Emergency notifications update" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Emergency notifications delete" ON notifications
  FOR DELETE USING (auth.role() = 'authenticated'); 