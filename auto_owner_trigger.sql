-- Auto Owner Trigger
-- Run this in your Supabase SQL editor

-- Create a trigger function to automatically add board creator as owner
CREATE OR REPLACE FUNCTION add_board_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the board creator as an owner in board_members
  INSERT INTO board_members (board_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS add_board_creator_as_owner_trigger ON boards;
CREATE TRIGGER add_board_creator_as_owner_trigger
  AFTER INSERT ON boards
  FOR EACH ROW
  EXECUTE FUNCTION add_board_creator_as_owner();

-- Test the trigger
INSERT INTO boards (title, description, created_by, is_public)
VALUES ('Auto Owner Test Board', 'Testing auto owner trigger', auth.uid(), false)
RETURNING id, title, created_by, is_public;

-- Check if the trigger worked
SELECT 
  b.id as board_id,
  b.title,
  b.created_by,
  bm.user_id as member_user_id,
  bm.role as member_role
FROM boards b
LEFT JOIN board_members bm ON b.id = bm.board_id
WHERE b.title = 'Auto Owner Test Board'
ORDER BY b.created_at DESC; 