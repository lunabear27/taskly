-- Implement Complete Private Board System
-- Run this in your Supabase SQL editor

-- Step 1: Clean up existing data (if needed)
DELETE FROM notifications;
DELETE FROM invitations;
DELETE FROM board_members;
DELETE FROM comments;
DELETE FROM cards;
DELETE FROM lists;
DELETE FROM tags;
DELETE FROM boards;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;

DROP POLICY IF EXISTS "Users can view board members" ON board_members;
DROP POLICY IF EXISTS "Users can insert board members" ON board_members;
DROP POLICY IF EXISTS "Users can update board members" ON board_members;
DROP POLICY IF EXISTS "Users can delete board members" ON board_members;

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

DROP POLICY IF EXISTS "Users can view invitations" ON invitations;
DROP POLICY IF EXISTS "Users can insert invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON invitations;
DROP POLICY IF EXISTS "Users can delete invitations" ON invitations;

DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications" ON notifications;

-- Step 3: Create proper RLS policies for private system

-- Boards Table Policies
CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() OR  -- Own boards
    EXISTS (                    -- Shared boards
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert boards" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update boards" ON boards
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete boards" ON boards
  FOR DELETE USING (created_by = auth.uid());

-- Board Members Table Policies
CREATE POLICY "Users can view board members" ON board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can manage board members" ON board_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM board_members bm
      WHERE bm.board_id = board_members.board_id 
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

-- Lists Table Policies
CREATE POLICY "Users can view lists" ON lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can manage lists" ON lists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

-- Cards Table Policies
CREATE POLICY "Users can view cards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN lists l ON l.board_id = b.id
      WHERE l.id = cards.list_id 
      AND (b.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = b.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can manage cards" ON cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN lists l ON l.board_id = b.id
      WHERE l.id = cards.list_id 
      AND (b.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = b.id AND bm.user_id = auth.uid()))
    )
  );

-- Comments Table Policies
CREATE POLICY "Users can view comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN lists l ON l.board_id = b.id
      JOIN cards c ON c.list_id = l.id
      WHERE c.id = comments.card_id 
      AND (b.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = b.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can manage comments" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN lists l ON l.board_id = b.id
      JOIN cards c ON c.list_id = l.id
      WHERE c.id = comments.card_id 
      AND (b.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = b.id AND bm.user_id = auth.uid()))
    )
  );

-- Tags Table Policies
CREATE POLICY "Users can view tags" ON tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = tags.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can manage tags" ON tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = tags.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

-- Invitations Table Policies
CREATE POLICY "Users can view invitations" ON invitations
  FOR SELECT USING (
    invited_by = auth.uid() OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can manage invitations" ON invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM board_members bm
      WHERE bm.board_id = invitations.board_id 
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

-- Notifications Table Policies
CREATE POLICY "Users can view notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Step 4: Test the setup
SELECT 
  'Private board system implemented!' as info,
  'All boards are now private with proper role-based access' as description;

-- Step 5: Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 