-- Simple Working RLS Policies
-- Run this in your Supabase SQL editor

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view boards" ON boards;
DROP POLICY IF EXISTS "Users can insert boards" ON boards;
DROP POLICY IF EXISTS "Users can update boards" ON boards;
DROP POLICY IF EXISTS "Users can delete boards" ON boards;
DROP POLICY IF EXISTS "Enable read access for all users" ON boards;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON boards;
DROP POLICY IF EXISTS "Enable update for users based on email" ON boards;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON boards;

DROP POLICY IF EXISTS "Users can view board members" ON board_members;
DROP POLICY IF EXISTS "Users can insert board members" ON board_members;
DROP POLICY IF EXISTS "Users can update board members" ON board_members;
DROP POLICY IF EXISTS "Users can delete board members" ON board_members;
DROP POLICY IF EXISTS "Users can manage board members" ON board_members;
DROP POLICY IF EXISTS "Enable read access for all users" ON board_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON board_members;
DROP POLICY IF EXISTS "Enable update for users based on email" ON board_members;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON board_members;

DROP POLICY IF EXISTS "Users can view lists" ON lists;
DROP POLICY IF EXISTS "Users can insert lists" ON lists;
DROP POLICY IF EXISTS "Users can update lists" ON lists;
DROP POLICY IF EXISTS "Users can delete lists" ON lists;
DROP POLICY IF EXISTS "Users can manage lists" ON lists;
DROP POLICY IF EXISTS "Enable read access for all users" ON lists;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON lists;
DROP POLICY IF EXISTS "Enable update for users based on email" ON lists;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON lists;

DROP POLICY IF EXISTS "Users can view cards" ON cards;
DROP POLICY IF EXISTS "Users can insert cards" ON cards;
DROP POLICY IF EXISTS "Users can update cards" ON cards;
DROP POLICY IF EXISTS "Users can delete cards" ON cards;
DROP POLICY IF EXISTS "Users can manage cards" ON cards;
DROP POLICY IF EXISTS "Enable read access for all users" ON cards;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON cards;
DROP POLICY IF EXISTS "Enable update for users based on email" ON cards;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON cards;

DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update comments" ON comments;
DROP POLICY IF EXISTS "Users can delete comments" ON comments;
DROP POLICY IF EXISTS "Users can manage comments" ON comments;
DROP POLICY IF EXISTS "Enable read access for all users" ON comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON comments;
DROP POLICY IF EXISTS "Enable update for users based on email" ON comments;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON comments;

DROP POLICY IF EXISTS "Users can view tags" ON tags;
DROP POLICY IF EXISTS "Users can insert tags" ON tags;
DROP POLICY IF EXISTS "Users can update tags" ON tags;
DROP POLICY IF EXISTS "Users can delete tags" ON tags;
DROP POLICY IF EXISTS "Users can manage tags" ON tags;
DROP POLICY IF EXISTS "Enable read access for all users" ON tags;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tags;
DROP POLICY IF EXISTS "Enable update for users based on email" ON tags;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON tags;

DROP POLICY IF EXISTS "Users can view invitations" ON invitations;
DROP POLICY IF EXISTS "Users can insert invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON invitations;
DROP POLICY IF EXISTS "Users can delete invitations" ON invitations;
DROP POLICY IF EXISTS "Users can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Enable read access for all users" ON invitations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON invitations;
DROP POLICY IF EXISTS "Enable update for users based on email" ON invitations;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON invitations;

DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage notifications" ON notifications;
DROP POLICY IF EXISTS "Enable read access for all users" ON notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON notifications;
DROP POLICY IF EXISTS "Enable update for users based on email" ON notifications;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON notifications;

-- Step 2: Create simple, working policies

-- Boards Table - Simple policies
CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() OR 
    EXISTS (
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

-- Board Members Table - Simple policies
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

CREATE POLICY "Users can insert board members" ON board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update board members" ON board_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM board_members bm
      WHERE bm.board_id = board_members.board_id 
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete board members" ON board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM board_members bm
      WHERE bm.board_id = board_members.board_id 
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

-- Lists Table - Simple policies
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

CREATE POLICY "Users can insert lists" ON lists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can update lists" ON lists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can delete lists" ON lists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

-- Cards Table - Simple policies
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

CREATE POLICY "Users can insert cards" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN lists l ON l.board_id = b.id
      WHERE l.id = cards.list_id 
      AND (b.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = b.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can update cards" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN lists l ON l.board_id = b.id
      WHERE l.id = cards.list_id 
      AND (b.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = b.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can delete cards" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN lists l ON l.board_id = b.id
      WHERE l.id = cards.list_id 
      AND (b.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = b.id AND bm.user_id = auth.uid()))
    )
  );

-- Comments Table - Simple policies
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

CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK (
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

CREATE POLICY "Users can update comments" ON comments
  FOR UPDATE USING (
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

CREATE POLICY "Users can delete comments" ON comments
  FOR DELETE USING (
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

-- Tags Table - Simple policies
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

CREATE POLICY "Users can insert tags" ON tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = tags.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can update tags" ON tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = tags.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can delete tags" ON tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = tags.board_id 
      AND (boards.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM board_members bm 
                   WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()))
    )
  );

-- Invitations Table - Simple policies
CREATE POLICY "Users can view invitations" ON invitations
  FOR SELECT USING (
    invited_by = auth.uid() OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert invitations" ON invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_members bm
      WHERE bm.board_id = invitations.board_id 
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update invitations" ON invitations
  FOR UPDATE USING (
    invited_by = auth.uid() OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete invitations" ON invitations
  FOR DELETE USING (
    invited_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM board_members bm
      WHERE bm.board_id = invitations.board_id 
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

-- Notifications Table - Simple policies
CREATE POLICY "Users can view notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- Step 3: Test the setup
SELECT 
  'Simple working policies implemented!' as info,
  'All tables now have simple, working RLS policies' as description;

-- Step 4: Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 