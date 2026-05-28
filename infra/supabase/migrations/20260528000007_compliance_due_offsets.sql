-- WO-015: Task due date offsets from employee start date
-- WO-018: Training module display order for HR admin reordering

BEGIN;

ALTER TABLE public.template_tasks
  ADD COLUMN IF NOT EXISTS due_date_offset_days INT NOT NULL DEFAULT 0;

ALTER TABLE public.training_modules
  ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

COMMIT;
