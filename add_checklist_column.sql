-- Add checklist column to existing cards table
-- Run this in your Supabase SQL editor if you already have the cards table

ALTER TABLE cards ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'; 