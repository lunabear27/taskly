-- FINAL COMPREHENSIVE FIX SCRIPT
-- This script will fix all the issues

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

-- 2. Create automatic profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, username, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Fix card position trigger (non-recursive)
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

-- 4. Verify all fixes
SELECT '✅ All fixes applied successfully!' as status;

-- Show current state
SELECT 
  'User profiles' as info,
  COUNT(*) as total_profiles
FROM user_profiles;

SELECT 
  'Active triggers' as info,
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'card_position_trigger'); 