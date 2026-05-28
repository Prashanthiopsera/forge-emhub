-- WO-032: Allow HR admins to create onboarding plans for new hires

BEGIN;

CREATE POLICY onboarding_plans_write_hr ON public.onboarding_plans
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

COMMIT;
