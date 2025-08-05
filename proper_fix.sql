-- Proper RLS Fix - Secure but Functional
-- Run this in your Supabase SQL editor after the emergency fix

-- Drop the emergency policies
DROP POLICY IF EXISTS "Emergency boards view" ON boards;
DROP POLICY IF EXISTS "Emergency boards insert" ON boards;
DROP POLICY IF EXISTS "Emergency boards update" ON boards;
DROP POLICY IF EXISTS "Emergency boards delete" ON boards;

DROP POLICY IF EXISTS "Emergency lists view" ON lists;
DROP POLICY IF EXISTS "Emergency lists insert" ON lists;
DROP POLICY IF EXISTS "Emergency lists update" ON lists;
DROP POLICY IF EXISTS "Emergency lists delete" ON lists;

DROP POLICY IF EXISTS "Emergency cards view" ON cards;
DROP POLICY IF EXISTS "Emergency cards insert" ON cards;
DROP POLICY IF EXISTS "Emergency cards update" ON cards;
DROP POLICY IF EXISTS "Emergency cards delete" ON cards;

DROP POLICY IF EXISTS "Emergency comments view" ON comments;
DROP POLICY IF EXISTS "Emergency comments insert" ON comments;
DROP POLICY IF EXISTS "Emergency comments update" ON comments;
DROP POLICY IF EXISTS "Emergency comments delete" ON comments;

DROP POLICY IF EXISTS "Emergency tags view" ON tags;
DROP POLICY IF EXISTS "Emergency tags insert" ON tags;
DROP POLICY IF EXISTS "Emergency tags update" ON tags;
DROP POLICY IF EXISTS "Emergency tags delete" ON tags;

DROP POLICY IF EXISTS "Emergency board_members view" ON board_members;
DROP POLICY IF EXISTS "Emergency board_members insert" ON board_members;
DROP POLICY IF EXISTS "Emergency board_members update" ON board_members;
DROP POLICY IF EXISTS "Emergency board_members delete" ON board_members;

DROP POLICY IF EXISTS "Emergency invitations view" ON invitations;
DROP POLICY IF EXISTS "Emergency invitations insert" ON invitations;
DROP POLICY IF EXISTS "Emergency invitations update" ON invitations;
DROP POLICY IF EXISTS "Emergency invitations delete" ON invitations;

DROP POLICY IF EXISTS "Emergency notifications view" ON notifications;
DROP POLICY IF EXISTS "Emergency notifications insert" ON notifications;
DROP POLICY IF EXISTS "Emergency notifications update" ON notifications;
DROP POLICY IF EXISTS "Emergency notifications delete" ON notifications;

-- Create proper restrictive policies for boards
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
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete boards" ON boards
  FOR DELETE USING (created_by = auth.uid());

-- Create proper policies for lists
CREATE POLICY "Users can view lists" ON lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = lists.board_id AND (
        created_by = auth.uid() OR 
        is_public = true OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = lists.board_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert lists" ON lists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = lists.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = lists.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Users can update lists" ON lists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = lists.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = lists.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Users can delete lists" ON lists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = lists.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = lists.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- Create proper policies for cards
CREATE POLICY "Users can view cards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND (
        b.created_by = auth.uid() OR 
        b.is_public = true OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert cards" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Users can update cards" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Users can delete cards" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- Create proper policies for comments
CREATE POLICY "Users can view comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = comments.card_id AND (
        b.created_by = auth.uid() OR 
        b.is_public = true OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = comments.card_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Users can update comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- Create proper policies for tags
CREATE POLICY "Users can view tags" ON tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = tags.board_id AND (
        created_by = auth.uid() OR 
        is_public = true OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = tags.board_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert tags" ON tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = tags.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = tags.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

CREATE POLICY "Users can update tags" ON tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = tags.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = tags.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

CREATE POLICY "Users can delete tags" ON tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = tags.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = tags.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- Create proper policies for board members
CREATE POLICY "Users can view board members" ON board_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members bm2
          WHERE bm2.board_id = board_members.board_id AND bm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert board members" ON board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = board_members.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

CREATE POLICY "Users can update board members" ON board_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = board_members.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

CREATE POLICY "Users can delete board members" ON board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = board_members.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- Create proper policies for invitations
CREATE POLICY "Users can view invitations" ON invitations
  FOR SELECT USING (
    invited_by = auth.uid() OR
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert invitations" ON invitations
  FOR INSERT WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = invitations.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = invitations.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
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
      SELECT 1 FROM boards 
      WHERE id = invitations.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = invitations.board_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- Create proper policies for notifications
CREATE POLICY "Users can view notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid()); 