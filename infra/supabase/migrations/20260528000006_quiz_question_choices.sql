-- WO-017: Multiple-choice options for quiz questions

ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS choices JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS correct_index INT NOT NULL DEFAULT 0;
