-- Add starred field to boards table
-- Run this in your Supabase SQL editor

-- Add is_starred column to boards table
ALTER TABLE boards ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;

-- Create index for better performance when filtering starred boards
CREATE INDEX IF NOT EXISTS idx_boards_is_starred ON boards(is_starred);

-- Update existing boards to have is_starred = false
UPDATE boards SET is_starred = false WHERE is_starred IS NULL;

-- Success message
SELECT 'Starred field added successfully! You can now star/unstar boards.' as status; 