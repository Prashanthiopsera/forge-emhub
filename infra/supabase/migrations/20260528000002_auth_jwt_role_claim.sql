-- WO-008: JWT role claim from profiles + auto-create profile on signup

-- Inject `app_role` into access token JWT from public.profiles (do not overwrite JWT `role` = authenticated).
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  original_claims jsonb;
  new_claims jsonb;
  user_role public.app_role;
BEGIN
  original_claims := event->'claims';
  new_claims := original_claims;

  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid
    AND deleted_at IS NULL;

  IF user_role IS NOT NULL THEN
    new_claims := jsonb_set(new_claims, '{app_role}', to_jsonb(user_role::text));
  END IF;

  RETURN jsonb_build_object('claims', new_claims);
END;
$$;

REVOKE ALL ON FUNCTION public.custom_access_token_hook(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- Create a profile row when a new auth user signs up (default role: employee).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    'employee'::public.app_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
