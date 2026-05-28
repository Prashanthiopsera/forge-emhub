-- WO-006: Row Level Security policies for four-role access model

BEGIN;

-- ─── Helpers ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_hr_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_app_role() = 'hr_admin'::public.app_role;
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_app_role() = 'manager'::public.app_role;
$$;

CREATE OR REPLACE FUNCTION public.is_it_ops()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_app_role() = 'it_ops'::public.app_role;
$$;

CREATE OR REPLACE FUNCTION public.is_direct_report(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_user_id
      AND manager_id = auth.uid()
      AND deleted_at IS NULL
  );
$$;

-- ─── Enable RLS on all public tables ────────────────────────────────────────

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_chart_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ─── departments (read for authenticated) ───────────────────────────────────

CREATE POLICY departments_select_authenticated ON public.departments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY departments_write_hr ON public.departments
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

-- ─── profiles ───────────────────────────────────────────────────────────────

CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_hr_admin() OR public.is_direct_report(id));

CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_write_hr ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

-- ─── content templates (HR admin CRUD; others read published templates) ───

CREATE POLICY onboarding_templates_select ON public.onboarding_templates
  FOR SELECT TO authenticated
  USING (active = true OR public.is_hr_admin());

CREATE POLICY onboarding_templates_write_hr ON public.onboarding_templates
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

CREATE POLICY template_tasks_select ON public.template_tasks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY template_tasks_write_hr ON public.template_tasks
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

-- ─── onboarding plans & task progress ─────────────────────────────────────

CREATE POLICY onboarding_plans_select ON public.onboarding_plans
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_hr_admin()
    OR public.is_direct_report(user_id)
  );

CREATE POLICY task_progress_select ON public.task_progress
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_hr_admin()
    OR (public.is_manager() AND public.is_direct_report(user_id))
  );

CREATE POLICY task_progress_update_own ON public.task_progress
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY task_progress_write_hr ON public.task_progress
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

-- ─── training (HR manages modules; employees own progress) ────────────────

CREATE POLICY training_modules_select ON public.training_modules
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY training_modules_write_hr ON public.training_modules
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

CREATE POLICY video_progress_select ON public.video_progress
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_hr_admin()
    OR (public.is_manager() AND public.is_direct_report(user_id))
  );

CREATE POLICY video_progress_update_own ON public.video_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY quizzes_select ON public.quizzes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY quizzes_write_hr ON public.quizzes
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

CREATE POLICY quiz_questions_select ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY quiz_questions_write_hr ON public.quiz_questions
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

CREATE POLICY quiz_attempts_select ON public.quiz_attempts
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_hr_admin()
    OR (public.is_manager() AND public.is_direct_report(user_id))
  );

CREATE POLICY quiz_attempts_insert_own ON public.quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ─── FAQ & org chart (read published; HR CRUD) ──────────────────────────────

CREATE POLICY faq_categories_select ON public.faq_categories
  FOR SELECT TO authenticated
  USING (active = true OR public.is_hr_admin());

CREATE POLICY faq_categories_write_hr ON public.faq_categories
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

CREATE POLICY faq_articles_select ON public.faq_articles
  FOR SELECT TO authenticated
  USING (published = true OR public.is_hr_admin());

CREATE POLICY faq_articles_write_hr ON public.faq_articles
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

CREATE POLICY org_chart_nodes_select ON public.org_chart_nodes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY org_chart_nodes_write_hr ON public.org_chart_nodes
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

-- ─── chatbot ────────────────────────────────────────────────────────────────

CREATE POLICY chat_sessions_select ON public.chat_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_hr_admin());

CREATE POLICY chat_sessions_write_own ON public.chat_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY chat_messages_select ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.is_hr_admin())
    )
  );

CREATE POLICY chat_messages_insert_own ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- ─── notifications (IT ops: provisioning-related only) ──────────────────────

CREATE POLICY notifications_select ON public.notifications
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_hr_admin()
    OR (
      public.is_it_ops()
      AND (
        target_role = 'it_ops'::public.app_role
        OR (payload->>'type') = 'provisioning'
      )
    )
  );

CREATE POLICY notifications_update_it_provisioning ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    public.is_it_ops()
    AND (
      target_role = 'it_ops'::public.app_role
      OR (payload->>'type') = 'provisioning'
    )
  )
  WITH CHECK (
    public.is_it_ops()
    AND (
      target_role = 'it_ops'::public.app_role
      OR (payload->>'type') = 'provisioning'
    )
  );

CREATE POLICY notifications_write_hr ON public.notifications
  FOR ALL TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

-- ─── audit_log (HR read; writes via security definer triggers) ─────────────

CREATE POLICY audit_log_select_hr ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.is_hr_admin());

COMMIT;
