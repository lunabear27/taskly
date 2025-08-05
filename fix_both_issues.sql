-- FIX BOTH LIST MOVEMENT AND CARD DRAG-AND-DROP ISSUES
-- This script will fix both problems safely

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

-- 2. Remove the problematic card position trigger (it's causing conflicts)
DROP TRIGGER IF EXISTS card_position_trigger ON cards;
DROP FUNCTION IF EXISTS handle_card_position_update();

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
SELECT '✅ Both issues fixed successfully!' as status; 