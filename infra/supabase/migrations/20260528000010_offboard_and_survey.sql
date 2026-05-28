-- WO-035: Offboarding date for PII deletion workflow
-- WO-043: Day-30 satisfaction survey responses

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS offboarded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_offboarded_at ON public.profiles (offboarded_at)
  WHERE offboarded_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  satisfaction_score INT NOT NULL CHECK (satisfaction_score BETWEEN 1 AND 5),
  went_well TEXT,
  could_improve TEXT,
  would_recommend INT CHECK (would_recommend BETWEEN 0 AND 10),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY survey_responses_select ON public.survey_responses
  FOR SELECT USING (user_id = auth.uid() OR public.is_hr_admin());

CREATE POLICY survey_responses_insert_own ON public.survey_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());
