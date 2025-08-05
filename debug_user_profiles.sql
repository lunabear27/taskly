-- Debug script to check user profiles and board members
-- Run this in your Supabase SQL editor

-- First, let's see what columns exist in user_profiles
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- Check user_profiles table
SELECT 
  'User Profiles' as table_name,
  COUNT(*) as count
FROM user_profiles;

-- Show sample user profiles (without full_name)
SELECT 
  id,
  email,
  username,
  created_at
FROM user_profiles
LIMIT 10;

-- Check board_members table
SELECT 
  'Board Members' as table_name,
  COUNT(*) as count
FROM board_members;

-- Show sample board members
SELECT 
  bm.id,
  bm.board_id,
  bm.user_id,
  bm.role,
  b.title as board_title,
  up.email as user_email,
  up.username as user_username
FROM board_members bm
JOIN boards b ON bm.board_id = b.id
LEFT JOIN user_profiles up ON bm.user_id = up.id
LIMIT 10;

-- Check specific board members for your board (replace with your board ID)
SELECT 
  bm.id,
  bm.board_id,
  bm.user_id,
  bm.role,
  b.title as board_title,
  up.email as user_email,
  up.username as user_username
FROM board_members bm
JOIN boards b ON bm.board_id = b.id
LEFT JOIN user_profiles up ON bm.user_id = up.id
WHERE bm.board_id = '09b5a92d-11ea-45b4-a4ff-99e3684c9cbd'; 