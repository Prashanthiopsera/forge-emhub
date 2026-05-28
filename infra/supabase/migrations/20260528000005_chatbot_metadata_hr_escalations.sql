-- WO-021 / WO-022: Chat message metadata (source) and HR reply on escalated sessions

BEGIN;

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE POLICY chat_messages_insert_hr ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_hr_admin()
    AND sender_type = 'hr'
    AND EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = session_id AND s.escalated = true
    )
  );

CREATE POLICY notifications_insert_escalation ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    channel = 'in_app'
    AND target_role = 'hr_admin'::public.app_role
    AND (payload->>'type') = 'escalation'
    AND EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = ((payload->>'session_id')::uuid)
        AND s.user_id = auth.uid()
        AND s.escalated = true
    )
  );

COMMIT;
