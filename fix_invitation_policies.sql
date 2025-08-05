-- Fix RLS Policies for All Tables
-- Run this in your Supabase SQL editor

-- Step 1: Enable RLS on all tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON boards;
DROP POLICY IF EXISTS "Enable update for board owners" ON boards;
DROP POLICY IF EXISTS "Enable delete for board owners" ON boards;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON board_members;

-- Step 3: Create proper policies for boards
CREATE POLICY "Users can view boards they have access to" ON boards
  FOR SELECT USING (
    is_public = true OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create boards" ON boards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update boards they own or are admin of" ON boards
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete boards they own" ON boards
  FOR DELETE USING (created_by = auth.uid());

-- Step 4: Create proper policies for board_members
CREATE POLICY "Users can view board members of boards they have access to" ON board_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND (
        is_public = true OR 
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members bm2
          WHERE bm2.board_id = board_members.board_id AND bm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can add members to boards they own or are admin of" ON board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members bm2
          WHERE bm2.board_id = board_members.board_id AND bm2.user_id = auth.uid() AND bm2.role IN ('owner', 'admin')
        )
      )
    )
  );

CREATE POLICY "Users can update board members of boards they own or are admin of" ON board_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members bm2
          WHERE bm2.board_id = board_members.board_id AND bm2.user_id = auth.uid() AND bm2.role IN ('owner', 'admin')
        )
      )
    )
  );

CREATE POLICY "Users can remove board members of boards they own or are admin of" ON board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members bm2
          WHERE bm2.board_id = board_members.board_id AND bm2.user_id = auth.uid() AND bm2.role IN ('owner', 'admin')
        )
      )
    )
  );

-- Step 5: Create policies for invitations
CREATE POLICY "Users can view invitations sent to them" ON invitations
  FOR SELECT USING (
    invited_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view invitations they sent" ON invitations
  FOR SELECT USING (invited_by = auth.uid());

CREATE POLICY "Users can create invitations for boards they own or are admin of" ON invitations
  FOR INSERT WITH CHECK (
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

CREATE POLICY "Users can update invitations they sent" ON invitations
  FOR UPDATE USING (invited_by = auth.uid());

CREATE POLICY "Users can delete invitations they sent" ON invitations
  FOR DELETE USING (invited_by = auth.uid());

-- Step 6: Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- Step 7: Create policies for lists
CREATE POLICY "Users can view lists of boards they have access to" ON lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = lists.board_id AND (
        is_public = true OR 
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = lists.board_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create lists in boards they have access to" ON lists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = lists.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = lists.board_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update lists in boards they have access to" ON lists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = lists.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = lists.board_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can delete lists in boards they own or are admin of" ON lists
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

-- Step 8: Create policies for cards
CREATE POLICY "Users can view cards in boards they have access to" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND (
        b.is_public = true OR 
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create cards in boards they have access to" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update cards in boards they have access to" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can delete cards in boards they have access to" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Step 9: Create policies for comments
CREATE POLICY "Users can view comments in boards they have access to" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = comments.card_id AND (
        b.is_public = true OR 
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create comments in boards they have access to" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = comments.card_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own comments or comments in boards they own" ON comments
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = comments.card_id AND b.created_by = auth.uid()
    )
  );

-- Step 10: Create policies for tags
CREATE POLICY "Users can view tags in boards they have access to" ON tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = tags.board_id AND (
        is_public = true OR 
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = tags.board_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create tags in boards they have access to" ON tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = tags.board_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = tags.board_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update tags in boards they own or are admin of" ON tags
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

CREATE POLICY "Users can delete tags in boards they own or are admin of" ON tags
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

-- Step 11: Verify all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('boards', 'board_members', 'invitations', 'notifications', 'lists', 'cards', 'comments', 'tags')
ORDER BY tablename, policyname; 