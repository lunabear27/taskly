-- Debug Auth UID Issue
-- Run this in your Supabase SQL editor

-- Check if auth.uid() works in SELECT
SELECT 
  'Auth UID in SELECT:' as info,
  auth.uid() as user_id;

-- Check if auth.uid() works in INSERT
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Debug Test', 'Testing auth.uid() in INSERT', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Check what happened
SELECT 
  id, 
  title, 
  created_by, 
  is_public,
  CASE 
    WHEN created_by = auth.uid() THEN 'MATCHES'
    WHEN created_by IS NULL THEN 'NULL'
    ELSE 'DIFFERENT'
  END as status
FROM boards 
WHERE title = 'Debug Test'
ORDER BY created_at DESC;

-- Clean up test board
DELETE FROM boards WHERE title = 'Debug Test'; 