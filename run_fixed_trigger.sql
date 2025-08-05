-- RUN FIXED TRIGGER SCRIPT
-- This script will create a trigger that avoids infinite recursion

-- Drop any existing problematic trigger
DROP TRIGGER IF EXISTS card_position_trigger ON cards;

-- Create a simpler, more efficient function
CREATE OR REPLACE FUNCTION handle_card_position_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only handle INSERT and DELETE operations to avoid recursion
  -- For UPDATE operations, we'll handle position management in the application layer
  
  IF TG_OP = 'INSERT' THEN
    -- For new cards, just ensure they have a valid position
    IF NEW.position IS NULL THEN
      -- Get the next available position
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

-- Create the trigger only for INSERT and DELETE
CREATE TRIGGER card_position_trigger
  AFTER INSERT OR DELETE ON cards
  FOR EACH ROW EXECUTE FUNCTION handle_card_position_update();

-- Verify the trigger
SELECT 
  '✅ Fixed trigger created successfully!' as status,
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'card_position_trigger'; 