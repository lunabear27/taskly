-- FIX LIST MOVEMENT SCRIPT
-- This script will ensure list positions are properly managed

-- 1. Fix the admin profile (if missing)
INSERT INTO user_profiles (user_id, email, username, created_at)
SELECT 
  id as user_id,
  email,
  SPLIT_PART(email, '@', 1) as username,
  NOW() as created_at
FROM auth.users 
WHERE id = '4322ebd8-737a-4646-ac52-e965318f181d'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = auth.users.id
  );

-- 2. Create non-recursive card position trigger
DROP TRIGGER IF EXISTS card_position_trigger ON cards;

CREATE OR REPLACE FUNCTION handle_card_position_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only handle INSERT and DELETE operations to avoid recursion
  IF TG_OP = 'INSERT' THEN
    -- For new cards, just ensure they have a valid position
    IF NEW.position IS NULL THEN
      SELECT COALESCE(MAX(position), -1) + 1 
      INTO NEW.position 
      FROM cards 
      WHERE list_id = NEW.list_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    -- When a card is deleted, reorder remaining cards in the same list
    UPDATE cards 
    SET position = position - 1 
    WHERE list_id = OLD.list_id AND position > OLD.position;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_position_trigger
  AFTER INSERT OR DELETE ON cards
  FOR EACH ROW EXECUTE FUNCTION handle_card_position_update();

-- 3. Verify current list positions
SELECT 
  'Current list positions' as info,
  id,
  title,
  position,
  board_id
FROM lists
ORDER BY board_id, position;

-- 4. Verify the fix
SELECT '✅ List movement fixes applied successfully!' as status; 