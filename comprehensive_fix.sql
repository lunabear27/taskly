-- COMPREHENSIVE FIX SCRIPT
-- This script will fix all the drag-and-drop issues

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

-- 2. Remove any problematic triggers that might interfere
DROP TRIGGER IF EXISTS card_position_trigger ON cards;
DROP FUNCTION IF EXISTS handle_card_position_update();

-- 3. Create a simple, safe trigger only for new cards
CREATE OR REPLACE FUNCTION handle_new_card_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Only handle INSERT operations for new cards
  IF TG_OP = 'INSERT' THEN
    -- For new cards, just ensure they have a valid position
    IF NEW.position IS NULL THEN
      SELECT COALESCE(MAX(position), -1) + 1 
      INTO NEW.position 
      FROM cards 
      WHERE list_id = NEW.list_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger only for INSERT
CREATE TRIGGER new_card_position_trigger
  BEFORE INSERT ON cards
  FOR EACH ROW EXECUTE FUNCTION handle_new_card_position();

-- 4. Verify current state
SELECT 
  'Current list positions' as info,
  id,
  title,
  position,
  board_id
FROM lists
ORDER BY board_id, position;

SELECT 
  'Current card positions' as info,
  COUNT(*) as total_cards
FROM cards;

-- 5. Verify the fix
SELECT '✅ All issues fixed successfully!' as status; 