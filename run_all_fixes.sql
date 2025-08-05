-- COMPREHENSIVE FIX SCRIPT
-- This script will run all the necessary fixes for the app

-- 1. Fix the admin profile
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

-- 2. Create the trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new user profile when a new user signs up
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

-- Create the trigger that calls the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Fix card position updates
CREATE OR REPLACE FUNCTION handle_card_position_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an UPDATE and the list_id or position has changed
  IF TG_OP = 'UPDATE' AND (OLD.list_id != NEW.list_id OR OLD.position != NEW.position) THEN
    -- If moving to a different list
    IF OLD.list_id != NEW.list_id THEN
      -- Reorder positions in the old list (shift remaining cards up)
      UPDATE cards 
      SET position = position - 1 
      WHERE list_id = OLD.list_id AND position > OLD.position;
      
      -- Reorder positions in the new list (shift cards down to make room)
      UPDATE cards 
      SET position = position + 1 
      WHERE list_id = NEW.list_id AND position >= NEW.position AND id != NEW.id;
    ELSE
      -- Same list reordering
      IF OLD.position < NEW.position THEN
        -- Moving down: shift cards between old and new position up
        UPDATE cards 
        SET position = position - 1 
        WHERE list_id = NEW.list_id AND position > OLD.position AND position <= NEW.position AND id != NEW.id;
      ELSE
        -- Moving up: shift cards between new and old position down
        UPDATE cards 
        SET position = position + 1 
        WHERE list_id = NEW.list_id AND position >= NEW.position AND position < OLD.position AND id != NEW.id;
      END IF;
    END IF;
  END IF;
  
  -- If this is an INSERT
  IF TG_OP = 'INSERT' THEN
    -- Shift existing cards down to make room for the new card
    UPDATE cards 
    SET position = position + 1 
    WHERE list_id = NEW.list_id AND position >= NEW.position AND id != NEW.id;
  END IF;
  
  -- If this is a DELETE
  IF TG_OP = 'DELETE' THEN
    -- Shift remaining cards up to fill the gap
    UPDATE cards 
    SET position = position - 1 
    WHERE list_id = OLD.list_id AND position > OLD.position;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS card_position_trigger ON cards;
CREATE TRIGGER card_position_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cards
  FOR EACH ROW EXECUTE FUNCTION handle_card_position_update();

-- 4. Verify all fixes
SELECT '✅ All fixes applied successfully!' as status;

-- Show current user profiles
SELECT 
  'User profiles' as info,
  COUNT(*) as total_profiles
FROM user_profiles;

-- Show current card positions
SELECT 
  'Current card positions' as info,
  COUNT(*) as total_cards
FROM cards;

-- Show triggers
SELECT 
  'Active triggers' as info,
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'card_position_trigger'); 