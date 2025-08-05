-- FIX CARD POSITIONS SCRIPT
-- This script will create triggers to properly handle card position updates

-- Create a function to handle card position updates
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

-- Test the trigger by checking if it exists
SELECT 
  'Trigger created successfully' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'card_position_trigger';

-- Show current card positions to verify
SELECT 
  'Current card positions' as info,
  id,
  title,
  list_id,
  position
FROM cards
ORDER BY list_id, position; 