-- Debug realtime configuration
-- Run this in your Supabase SQL editor

-- 1. Check if realtime is enabled for your project
SELECT 
  'Realtime enabled for project' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN '✅ YES'
    ELSE '❌ NO'
  END as result;

-- 2. Check which tables are in the realtime publication
SELECT 
  'Tables in realtime publication' as check_type,
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

-- 3. Check publication details
SELECT 
  'Publication details' as check_type,
  pubname,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 4. Test realtime by creating a test record
INSERT INTO boards (title, description, created_by) 
VALUES ('Realtime Test Board', 'Testing realtime functionality', '4322ebd8-737a-4646-ac52-e965318f181d')
RETURNING id, title, created_at;

-- 5. Clean up test record
DELETE FROM boards WHERE title = 'Realtime Test Board';

-- 6. Check if there are any RLS policies that might interfere
SELECT 
  'RLS policies on boards' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'boards'; 