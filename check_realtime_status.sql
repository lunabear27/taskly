-- Check realtime status for all tables
-- Run this in your Supabase SQL editor

-- Check which tables are currently in the realtime publication
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = p.schemaname 
      AND tablename = p.tablename
    ) THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as realtime_status
FROM pg_tables p
WHERE schemaname = 'public'
  AND tablename IN (
    'boards',
    'lists', 
    'cards',
    'comments',
    'board_members',
    'tags',
    'assignees',
    'user_profiles'
  )
ORDER BY tablename;

-- Check the supabase_realtime publication details
SELECT 
  'supabase_realtime publication info' as info,
  pubname,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete
FROM pg_publication 
WHERE pubname = 'supabase_realtime'; 