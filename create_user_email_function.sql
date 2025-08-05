-- Function to get user email by user ID
-- This function allows us to get real user emails for profile pictures
CREATE OR REPLACE FUNCTION get_user_email_by_id(user_id UUID)
RETURNS TABLE(email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function needs to be run with elevated privileges to access auth.users
  -- You may need to run this as a superuser or with appropriate permissions
  
  RETURN QUERY
  SELECT au.email::TEXT
  FROM auth.users au
  WHERE au.id = user_id;
  
  -- If no email found, return NULL
  IF NOT FOUND THEN
    RETURN;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email_by_id(UUID) TO authenticated;

-- Alternative approach: Create a view that exposes user emails
-- This might be easier to set up than the function above
CREATE OR REPLACE VIEW public.user_emails AS
SELECT 
  id,
  email,
  created_at
FROM auth.users;

-- Grant select permission to authenticated users
GRANT SELECT ON public.user_emails TO authenticated;

-- Create a simpler function that uses the view
CREATE OR REPLACE FUNCTION get_user_email_by_id_simple(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT email FROM public.user_emails WHERE id = user_id;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_email_by_id_simple(UUID) TO authenticated; 