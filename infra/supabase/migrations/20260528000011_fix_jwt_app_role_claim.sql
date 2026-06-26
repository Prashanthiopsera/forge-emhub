-- Fix: custom_access_token_hook must not overwrite JWT `role` (Postgres role: authenticated).
-- App RBAC role belongs in `app_role` claim only.

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
