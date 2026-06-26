-- WO-006: Manual RLS verification (run as authenticated role via Supabase SQL or JWT simulation)
-- Expect empty results when access is denied (not errors).

-- Employee (auth.uid = employee id): should see only own task_progress
-- SET request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000001';
SELECT count(*) FROM public.task_progress WHERE user_id <> auth.uid(); -- expect 0

-- Manager: should see direct reports only
-- SET auth to manager id a1000000-0000-4000-8000-000000000010
SELECT tp.* FROM public.task_progress tp
JOIN public.profiles p ON p.id = tp.user_id
WHERE p.manager_id = auth.uid();

-- HR admin: should see all rows
-- SET auth to hr id a1000000-0000-4000-8000-000000000020
SELECT count(*) FROM public.task_progress;

-- IT ops: provisioning notifications only
-- SET auth to it id a1000000-0000-4000-8000-000000000030
SELECT * FROM public.notifications
WHERE target_role = 'it_ops' OR payload->>'type' = 'provisioning';
