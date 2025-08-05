-- Temporary Fix: Disable RLS on problematic tables
-- This will completely bypass RLS to test if that's the issue
-- Run this in your Supabase SQL editor

-- Disable RLS on the problematic tables
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('invitations', 'notifications', 'board_members')
ORDER BY tablename; 