-- Add completed field to cards table
ALTER TABLE cards ADD COLUMN completed BOOLEAN DEFAULT false;

-- Create index for better performance when filtering by completed status
CREATE INDEX idx_cards_completed ON cards(completed); 