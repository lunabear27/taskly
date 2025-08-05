-- Fix board members: Ensure all boards have their creators as members
-- This script will add missing board creators as members

-- First, let's see which boards don't have their creators as members
SELECT 
  b.id as board_id,
  b.title as board_title,
  b.created_by as creator_id,
  bm.user_id as member_id
FROM boards b
LEFT JOIN board_members bm ON b.id = bm.board_id AND b.created_by = bm.user_id
WHERE bm.user_id IS NULL;

-- Now add missing creators as owners
INSERT INTO board_members (board_id, user_id, role, created_at)
SELECT 
  b.id as board_id,
  b.created_by as user_id,
  'owner' as role,
  b.created_at
FROM boards b
LEFT JOIN board_members bm ON b.id = bm.board_id AND b.created_by = bm.user_id
WHERE bm.user_id IS NULL
ON CONFLICT (board_id, user_id) DO NOTHING;

-- Verify the fix
SELECT 
  'Fixed boards:' as status,
  COUNT(*) as count
FROM boards b
LEFT JOIN board_members bm ON b.id = bm.board_id AND b.created_by = bm.user_id
WHERE bm.user_id IS NOT NULL;

SELECT 
  'Boards with members:' as status,
  COUNT(DISTINCT board_id) as count
FROM board_members; 