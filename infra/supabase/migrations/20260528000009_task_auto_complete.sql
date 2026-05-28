-- WO-013: Task auto-completion on training events

ALTER TABLE public.template_tasks
  ADD COLUMN IF NOT EXISTS auto_complete_event TEXT;

ALTER TABLE public.task_progress
  ADD COLUMN IF NOT EXISTS completed_by TEXT;

CREATE INDEX IF NOT EXISTS idx_template_tasks_auto_complete_event
  ON public.template_tasks (auto_complete_event)
  WHERE auto_complete_event IS NOT NULL;

CREATE OR REPLACE FUNCTION public.auto_complete_tasks_for_event(
  p_user_id UUID,
  p_event_type TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INT;
BEGIN
  IF p_user_id IS NULL OR p_event_type IS NULL OR length(trim(p_event_type)) = 0 THEN
    RETURN 0;
  END IF;

  IF p_user_id <> auth.uid() AND NOT public.is_hr_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.task_progress tp
  SET
    status = 'completed',
    completed_at = COALESCE(tp.completed_at, now()),
    completed_by = 'system:' || p_event_type,
    updated_at = now()
  FROM public.template_tasks tt
  WHERE tp.template_task_id = tt.id
    AND tp.user_id = p_user_id
    AND tp.status IN ('pending', 'in_progress')
    AND tt.auto_complete_event = p_event_type;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_complete_tasks_for_event(UUID, TEXT) TO authenticated;
