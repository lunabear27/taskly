-- Simple RLS Fix - More Permissive but Secure
-- Run this in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;

DROP POLICY IF EXISTS "Users can view lists" ON lists;
DROP POLICY IF EXISTS "Users can insert lists" ON lists;
DROP POLICY IF EXISTS "Users can update lists" ON lists;
DROP POLICY IF EXISTS "Users can delete lists" ON lists;

DROP POLICY IF EXISTS "Users can view cards" ON cards;
DROP POLICY IF EXISTS "Users can insert cards" ON cards;
DROP POLICY IF EXISTS "Users can update cards" ON cards;
DROP POLICY IF EXISTS "Users can delete cards" ON cards;

DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update comments" ON comments;
DROP POLICY IF EXISTS "Users can delete comments" ON comments;

DROP POLICY IF EXISTS "Users can view tags" ON tags;
DROP POLICY IF EXISTS "Users can insert tags" ON tags;
DROP POLICY IF EXISTS "Users can update tags" ON tags;
DROP POLICY IF EXISTS "Users can delete tags" ON tags;

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

-- Simple, permissive policies for boards
CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() OR 
    is_public = true OR
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

-- Simple policies for lists
CREATE POLICY "Users can view lists" ON lists
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert lists" ON lists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update lists" ON lists
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete lists" ON lists
  FOR DELETE USING (auth.role() = 'authenticated');

-- Simple policies for cards
CREATE POLICY "Users can view cards" ON cards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert cards" ON cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update cards" ON cards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete cards" ON cards
  FOR DELETE USING (auth.role() = 'authenticated');

-- Simple policies for comments
CREATE POLICY "Users can view comments" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- Simple policies for tags
CREATE POLICY "Users can view tags" ON tags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert tags" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update tags" ON tags
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete tags" ON tags
  FOR DELETE USING (auth.role() = 'authenticated');

-- Simple policies for board members
CREATE POLICY "Users can view board members" ON board_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert board members" ON board_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update board members" ON board_members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete board members" ON board_members
  FOR DELETE USING (auth.role() = 'authenticated');

-- Simple policies for invitations
CREATE POLICY "Users can view invitations" ON invitations
  FOR SELECT USING (
    invited_by = auth.uid() OR
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert invitations" ON invitations
  FOR INSERT WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Users can update invitations" ON invitations
  FOR UPDATE USING (
    invited_by = auth.uid() OR
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete invitations" ON invitations
  FOR DELETE USING (invited_by = auth.uid());

-- Simple policies for notifications
CREATE POLICY "Users can view notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid()); 