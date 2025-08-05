-- Remove Public/Private Feature
-- Run this in your Supabase SQL editor

-- Step 1: Remove is_public column from boards table
ALTER TABLE boards DROP COLUMN IF EXISTS is_public;

-- Step 2: Update RLS policies to remove public board logic
DROP POLICY IF EXISTS "Users can view boards" ON boards;

CREATE POLICY "Users can view boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() OR  -- Own boards
    EXISTS (                    -- Shared boards only
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

-- Step 3: Update any existing board creation code
-- Remove is_public parameter from all INSERT statements

-- Step 4: Test the simplified setup
SELECT 
  'Public/private feature removed!' as info,
  'All boards are now private by default' as description;

-- Step 5: Verify current boards structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'boards' 
ORDER BY ordinal_position; 