-- WO-016: Catalog metadata for training modules (category filter, descriptions)

BEGIN;

ALTER TABLE public.training_modules
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS description TEXT;

COMMIT;
