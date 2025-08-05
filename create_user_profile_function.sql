-- CREATE USER PROFILE FUNCTION
-- This function can be called from the frontend to create user profiles

-- Create a function to create user profiles
CREATE OR REPLACE FUNCTION public.create_user_profile(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  user_email TEXT;
  username TEXT;
  profile_id UUID;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;
  
  -- If user doesn't exist, return error
  IF user_email IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  -- Extract username from email
  username := SPLIT_PART(user_email, '@', 1);
  
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid) THEN
    RETURN json_build_object('error', 'Profile already exists');
  END IF;
  
  -- Create the profile
  INSERT INTO user_profiles (user_id, email, username, created_at)
  VALUES (user_uuid, user_email, username, NOW())
  RETURNING id INTO profile_id;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'profile_id', profile_id,
    'email', user_email,
    'username', username
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID) TO authenticated;

-- Test the function (replace with actual user ID)
-- SELECT public.create_user_profile('4322ebd8-737a-4646-ac52-e965318f181d'); 