-- Comprehensive RLS Fix: Remove All Conflicting Policies and Create Simple Ones
-- This will fix the 406 errors by ensuring consistent, simple policies
-- Run this in your Supabase SQL editor

-- Step 1: Drop ALL existing policies on the problematic tables
-- Board Members
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON board_members;
DROP POLICY IF EXISTS "Users can view board members" ON board_members;
DROP POLICY IF EXISTS "Users can manage board members" ON board_members;

-- Invitations
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON invitations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON invitations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON invitations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON invitations;

-- Notifications
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON notifications;

-- Step 2: Disable RLS temporarily to clear any cached policies
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple permissive policies for board_members
CREATE POLICY "board_members_select_policy" ON board_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "board_members_insert_policy" ON board_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "board_members_update_policy" ON board_members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "board_members_delete_policy" ON board_members
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 5: Create simple permissive policies for invitations
CREATE POLICY "invitations_select_policy" ON invitations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "invitations_insert_policy" ON invitations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "invitations_update_policy" ON invitations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "invitations_delete_policy" ON invitations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 6: Create simple permissive policies for notifications
CREATE POLICY "notifications_select_policy" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "notifications_insert_policy" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "notifications_update_policy" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "notifications_delete_policy" ON notifications
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 7: Verify the policies are created
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