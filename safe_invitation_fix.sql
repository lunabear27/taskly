-- Safe Fix: Add Missing Policies for Invitations, Notifications, and Board Members
-- This maintains the current app-level isolation approach
-- Run this in your Supabase SQL editor

-- Step 1: Enable RLS on missing tables (if not already enabled)
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies on these tables (if any)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON invitations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON invitations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON invitations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON invitations;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON notifications;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON board_members;

-- Step 3: Create simple permissive policies for invitations (matching current approach)
CREATE POLICY "Enable read access for authenticated users" ON invitations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON invitations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON invitations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON invitations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 4: Create simple permissive policies for notifications (matching current approach)
CREATE POLICY "Enable read access for authenticated users" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON notifications
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 5: Create simple permissive policies for board_members (matching current approach)
CREATE POLICY "Enable read access for authenticated users" ON board_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON board_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON board_members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON board_members
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 6: Verify the policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('invitations', 'notifications', 'board_members')
ORDER BY tablename, policyname; 