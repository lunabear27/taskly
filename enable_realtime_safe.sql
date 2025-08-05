-- Enable real-time for all tables (Safe version)
-- Run this in your Supabase SQL editor

-- Enable real-time for boards table
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE boards;
        RAISE NOTICE 'Added boards to real-time publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'boards already in real-time publication';
    END;
END $$;

-- Enable real-time for lists table
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE lists;
        RAISE NOTICE 'Added lists to real-time publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'lists already in real-time publication';
    END;
END $$;

-- Enable real-time for cards table
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE cards;
        RAISE NOTICE 'Added cards to real-time publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'cards already in real-time publication';
    END;
END $$;

-- Enable real-time for comments table
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE comments;
        RAISE NOTICE 'Added comments to real-time publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'comments already in real-time publication';
    END;
END $$;

-- Enable real-time for board_members table
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE board_members;
        RAISE NOTICE 'Added board_members to real-time publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'board_members already in real-time publication';
    END;
END $$;

-- Enable real-time for tags table
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE tags;
        RAISE NOTICE 'Added tags to real-time publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'tags already in real-time publication';
    END;
END $$;

-- Enable real-time for assignees table
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE assignees;
        RAISE NOTICE 'Added assignees to real-time publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'assignees already in real-time publication';
    END;
END $$;

-- Success message
SELECT 'Real-time setup completed! All tables are now enabled for real-time updates.' as status; 