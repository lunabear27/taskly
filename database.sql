-- Enable RLS on all tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies for boards
CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (
    is_public = true OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage boards" ON boards
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create policies for board_members
CREATE POLICY "Users can view board members" ON board_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage board members" ON board_members
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND created_by = auth.uid()
    )
  );

-- Create policies for lists
CREATE POLICY "Users can view lists" ON lists
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

CREATE POLICY "Users can manage lists" ON lists
  FOR ALL USING (
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

-- Create policies for cards
CREATE POLICY "Users can view cards" ON cards
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

CREATE POLICY "Users can manage cards" ON cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- Create policies for comments
CREATE POLICY "Users can view comments" ON comments
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

CREATE POLICY "Users can manage comments" ON comments
  FOR ALL USING (
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

-- Create policies for tags
CREATE POLICY "Users can view tags" ON tags
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

CREATE POLICY "Users can manage tags" ON tags
  FOR ALL USING (
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

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE boards;
ALTER PUBLICATION supabase_realtime ADD TABLE board_members;
ALTER PUBLICATION supabase_realtime ADD TABLE lists;
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE tags; 