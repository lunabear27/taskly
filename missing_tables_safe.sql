-- Safe Database Tables for CardDetailModal
-- Run this in your Supabase SQL editor - checks for existing tables first

-- Create attachments table for file uploads (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attachments') THEN
        CREATE TABLE attachments (
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
        RAISE NOTICE 'Created attachments table';
    ELSE
        RAISE NOTICE 'attachments table already exists';
    END IF;
END $$;

-- Create card_activities table for tracking changes (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'card_activities') THEN
        CREATE TABLE card_activities (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          action_type TEXT NOT NULL, -- 'created', 'updated', 'commented', 'assigned', 'tagged', etc.
          description TEXT NOT NULL,
          metadata JSONB DEFAULT '{}', -- Store additional data like old_value, new_value, etc.
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created card_activities table';
    ELSE
        RAISE NOTICE 'card_activities table already exists';
    END IF;
END $$;

-- Create user_profiles table for extended user information (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        CREATE TABLE user_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
          username TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created user_profiles table';
    ELSE
        RAISE NOTICE 'user_profiles table already exists';
    END IF;
END $$;

-- Create indexes for better performance (if not exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_attachments_card_id') THEN
        CREATE INDEX idx_attachments_card_id ON attachments(card_id);
        RAISE NOTICE 'Created idx_attachments_card_id index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_attachments_uploaded_by') THEN
        CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
        RAISE NOTICE 'Created idx_attachments_uploaded_by index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_card_activities_card_id') THEN
        CREATE INDEX idx_card_activities_card_id ON card_activities(card_id);
        RAISE NOTICE 'Created idx_card_activities_card_id index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_card_activities_user_id') THEN
        CREATE INDEX idx_card_activities_user_id ON card_activities(user_id);
        RAISE NOTICE 'Created idx_card_activities_user_id index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_card_activities_action_type') THEN
        CREATE INDEX idx_card_activities_action_type ON card_activities(action_type);
        RAISE NOTICE 'Created idx_card_activities_action_type index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_user_profiles_user_id') THEN
        CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
        RAISE NOTICE 'Created idx_user_profiles_user_id index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_user_profiles_username') THEN
        CREATE INDEX idx_user_profiles_username ON user_profiles(username);
        RAISE NOTICE 'Created idx_user_profiles_username index';
    END IF;
END $$;

-- Enable RLS on new tables (if not already enabled)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attachments') THEN
        ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on attachments table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'card_activities') THEN
        ALTER TABLE card_activities ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on card_activities table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on user_profiles table';
    END IF;
END $$;

-- Create RLS policies for attachments (if not exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attachments') THEN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'attachments' AND policyname = 'Users can view attachments') THEN
            CREATE POLICY "Users can view attachments" ON attachments
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
            RAISE NOTICE 'Created "Users can view attachments" policy';
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'attachments' AND policyname = 'Users can manage attachments') THEN
            CREATE POLICY "Users can manage attachments" ON attachments
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
            RAISE NOTICE 'Created "Users can manage attachments" policy';
        END IF;
    END IF;
END $$;

-- Create RLS policies for card_activities (if not exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'card_activities') THEN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'card_activities' AND policyname = 'Users can view card activities') THEN
            CREATE POLICY "Users can view card activities" ON card_activities
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
            RAISE NOTICE 'Created "Users can view card activities" policy';
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'card_activities' AND policyname = 'Users can create card activities') THEN
            CREATE POLICY "Users can create card activities" ON card_activities
              FOR INSERT WITH CHECK (user_id = auth.uid());
            RAISE NOTICE 'Created "Users can create card activities" policy';
        END IF;
    END IF;
END $$;

-- Create RLS policies for user_profiles (if not exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view user profiles') THEN
            CREATE POLICY "Users can view user profiles" ON user_profiles
              FOR SELECT USING (true); -- Public profiles
            RAISE NOTICE 'Created "Users can view user profiles" policy';
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can manage their own profile') THEN
            CREATE POLICY "Users can manage their own profile" ON user_profiles
              FOR ALL USING (user_id = auth.uid());
            RAISE NOTICE 'Created "Users can manage their own profile" policy';
        END IF;
    END IF;
END $$;

-- Enable real-time for new tables (if not already added)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attachments') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE attachments;
        RAISE NOTICE 'Added attachments to real-time publication';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'card_activities') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE card_activities;
        RAISE NOTICE 'Added card_activities to real-time publication';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
        RAISE NOTICE 'Added user_profiles to real-time publication';
    END IF;
END $$;

-- Create functions for automatic activity tracking (if not exist)
DO $$ 
BEGIN
    -- Create log_card_activity function
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
    RAISE NOTICE 'Created/Updated log_card_activity function';
END $$;

-- Create trigger for card activity logging (if not exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'card_activity_trigger') THEN
        CREATE TRIGGER card_activity_trigger
          AFTER INSERT OR UPDATE ON cards
          FOR EACH ROW
          EXECUTE FUNCTION log_card_activity();
        RAISE NOTICE 'Created card_activity_trigger';
    END IF;
END $$;

-- Create function to log comment activities (if not exist)
DO $$ 
BEGIN
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
    RAISE NOTICE 'Created/Updated log_comment_activity function';
END $$;

-- Create trigger for comment activity logging (if not exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'comment_activity_trigger') THEN
        CREATE TRIGGER comment_activity_trigger
          AFTER INSERT ON comments
          FOR EACH ROW
          EXECUTE FUNCTION log_comment_activity();
        RAISE NOTICE 'Created comment_activity_trigger';
    END IF;
END $$;

-- Create function to log assignee activities (if not exist)
DO $$ 
BEGIN
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
    RAISE NOTICE 'Created/Updated log_assignee_activity function';
END $$;

-- Create trigger for assignee activity logging (if not exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'assignee_activity_trigger') THEN
        CREATE TRIGGER assignee_activity_trigger
          AFTER INSERT OR DELETE ON assignees
          FOR EACH ROW
          EXECUTE FUNCTION log_assignee_activity();
        RAISE NOTICE 'Created assignee_activity_trigger';
    END IF;
END $$;

-- Final success message
SELECT 'Database setup completed successfully! All tables, indexes, policies, and triggers are ready.' as status; 