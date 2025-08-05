-- Verify Clean Start Results
-- Run this in your Supabase SQL editor

-- Check if all data is deleted
SELECT 
  'Boards count:' as info,
  COUNT(*) as count
FROM boards;

SELECT 
  'Board members count:' as info,
  COUNT(*) as count
FROM board_members;

SELECT 
  'Lists count:' as info,
  COUNT(*) as count
FROM lists;

SELECT 
  'Cards count:' as info,
  COUNT(*) as count
FROM cards;

SELECT 
  'Comments count:' as info,
  COUNT(*) as count
FROM comments;

SELECT 
  'Tags count:' as info,
  COUNT(*) as count
FROM tags;

SELECT 
  'Invitations count:' as info,
  COUNT(*) as count
FROM invitations;

SELECT 
  'Notifications count:' as info,
  COUNT(*) as count
FROM notifications;

-- Check current user
SELECT 
  'Current user ID:' as info,
  auth.uid() as user_id;

-- Test board creation
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Test Board After Clean Start', 'Testing clean database', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Check if the test board is visible
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  CASE 
    WHEN created_by = auth.uid() THEN 'OWNER'
    WHEN created_by IS NULL THEN 'NULL CREATED_BY'
    WHEN is_public = true THEN 'PUBLIC'
    WHEN EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    ) THEN 'MEMBER'
    ELSE 'NO ACCESS'
  END as access_type
FROM boards 
ORDER BY created_at DESC
LIMIT 5; 