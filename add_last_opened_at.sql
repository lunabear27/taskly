-- Add last_opened_at field to boards table
-- Run this in your Supabase SQL editor

ALTER TABLE boards 
ADD COLUMN last_opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing boards to have last_opened_at = created_at
UPDATE boards 
SET last_opened_at = created_at 
WHERE last_opened_at IS NULL;

-- Create index for better performance
CREATE INDEX idx_boards_last_opened_at ON boards(last_opened_at); 