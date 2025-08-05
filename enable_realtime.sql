-- Enable real-time for Taskly tables
-- Run this in your Supabase SQL editor

-- Enable real-time for boards table
ALTER PUBLICATION supabase_realtime ADD TABLE boards;

-- Enable real-time for lists table
ALTER PUBLICATION supabase_realtime ADD TABLE lists;

-- Enable real-time for cards table
ALTER PUBLICATION supabase_realtime ADD TABLE cards;

-- Enable real-time for comments table
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Enable real-time for board_members table
ALTER PUBLICATION supabase_realtime ADD TABLE board_members;

-- Enable real-time for assignees table
ALTER PUBLICATION supabase_realtime ADD TABLE assignees;

-- Enable real-time for tags table
ALTER PUBLICATION supabase_realtime ADD TABLE tags;

-- Enable real-time for invitations table
ALTER PUBLICATION supabase_realtime ADD TABLE invitations;

-- Enable real-time for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable real-time for board_stars table
ALTER PUBLICATION supabase_realtime ADD TABLE board_stars;

-- Verify real-time is enabled
SELECT 
  schemaname,
  tablename,
  hasreplidentity
FROM pg_tables 
WHERE tablename IN ('boards', 'lists', 'cards', 'comments', 'board_members', 'assignees', 'tags', 'invitations', 'notifications', 'board_stars'); 