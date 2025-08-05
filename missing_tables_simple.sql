-- Simple Database Tables for CardDetailModal
-- Run this in your Supabase SQL editor

-- Create attachments table for file uploads
CREATE TABLE IF NOT EXISTS attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_activities table for tracking changes
CREATE TABLE IF NOT EXISTS card_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'commented', 'assigned', 'tagged', etc.
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Store additional data like old_value, new_value, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attachments_card_id ON attachments(card_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_card_activities_card_id ON card_activities(card_id);
CREATE INDEX IF NOT EXISTS idx_card_activities_user_id ON card_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_card_activities_action_type ON card_activities(action_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Enable RLS on new tables
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for attachments
CREATE POLICY IF NOT EXISTS "Users can view attachments" ON attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = attachments.card_id AND (
        b.is_public = true OR 
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage attachments" ON attachments
  FOR ALL USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = attachments.card_id AND (
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- Create RLS policies for card_activities
CREATE POLICY IF NOT EXISTS "Users can view card activities" ON card_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = card_activities.card_id AND (
        b.is_public = true OR 
        b.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_id = b.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY IF NOT EXISTS "Users can create card activities" ON card_activities
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for user_profiles
CREATE POLICY IF NOT EXISTS "Users can view user profiles" ON user_profiles
  FOR SELECT USING (true); -- Public profiles

CREATE POLICY IF NOT EXISTS "Users can manage their own profile" ON user_profiles
  FOR ALL USING (user_id = auth.uid());

-- Enable real-time for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE card_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- Create function for card activity logging
CREATE OR REPLACE FUNCTION log_card_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log card creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO card_activities (card_id, user_id, action_type, description)
    VALUES (NEW.id, NEW.created_by, 'created', 'Card created');
  END IF;
  
  -- Log card updates
  IF TG_OP = 'UPDATE' THEN
    -- Title change
    IF OLD.title != NEW.title THEN
      INSERT INTO card_activities (card_id, user_id, action_type, description, metadata)
      VALUES (NEW.id, auth.uid(), 'updated', 'Title updated', 
              jsonb_build_object('field', 'title', 'old_value', OLD.title, 'new_value', NEW.title));
    END IF;
    
    -- Description change
    IF OLD.description IS DISTINCT FROM NEW.description THEN
      INSERT INTO card_activities (card_id, user_id, action_type, description, metadata)
      VALUES (NEW.id, auth.uid(), 'updated', 'Description updated', 
              jsonb_build_object('field', 'description'));
    END IF;
    
    -- Due date change
    IF OLD.due_date IS DISTINCT FROM NEW.due_date THEN
      INSERT INTO card_activities (card_id, user_id, action_type, description, metadata)
      VALUES (NEW.id, auth.uid(), 'updated', 'Due date updated', 
              jsonb_build_object('field', 'due_date', 'old_value', OLD.due_date, 'new_value', NEW.due_date));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for card activity logging
DROP TRIGGER IF EXISTS card_activity_trigger ON cards;
CREATE TRIGGER card_activity_trigger
  AFTER INSERT OR UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION log_card_activity();

-- Create function to log comment activities
CREATE OR REPLACE FUNCTION log_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO card_activities (card_id, user_id, action_type, description)
    VALUES (NEW.card_id, NEW.user_id, 'commented', 'Added a comment');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment activity logging
DROP TRIGGER IF EXISTS comment_activity_trigger ON comments;
CREATE TRIGGER comment_activity_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION log_comment_activity();

-- Create function to log assignee activities
CREATE OR REPLACE FUNCTION log_assignee_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO card_activities (card_id, user_id, action_type, description, metadata)
    VALUES (NEW.card_id, NEW.assigned_by, 'assigned', 'User assigned to card', 
            jsonb_build_object('assigned_user_id', NEW.user_id));
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO card_activities (card_id, user_id, action_type, description, metadata)
    VALUES (OLD.card_id, auth.uid(), 'unassigned', 'User unassigned from card', 
            jsonb_build_object('unassigned_user_id', OLD.user_id));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assignee activity logging
DROP TRIGGER IF EXISTS assignee_activity_trigger ON assignees;
CREATE TRIGGER assignee_activity_trigger
  AFTER INSERT OR DELETE ON assignees
  FOR EACH ROW
  EXECUTE FUNCTION log_assignee_activity();

-- Success message
SELECT 'Database setup completed successfully! All tables, indexes, policies, and triggers are ready.' as status; 