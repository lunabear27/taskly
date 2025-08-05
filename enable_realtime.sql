-- Enable real-time for all tables
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

-- Enable real-time for tags table
ALTER PUBLICATION supabase_realtime ADD TABLE tags;

-- Enable real-time for assignees table
ALTER PUBLICATION supabase_realtime ADD TABLE assignees;

-- Success message
SELECT 'Real-time enabled for all tables! Your app will now receive live updates.' as status; 