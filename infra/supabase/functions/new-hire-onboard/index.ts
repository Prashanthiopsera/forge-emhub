/**
 * WO-032: New hire onboarding stub — creates auth user, profile, plan, and task_progress.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface NewHirePayload {
  fullName: string;
  email: string;
  role: string;
  departmentId: string;
  managerId?: string | null;
  startDate: string;
  jobTitle?: string | null;
  photoUrl?: string | null;
  templateId?: string | null;
}

function computeDueAt(startDate: string, offsetDays: number): string {
  const start = new Date(`${startDate}T12:00:00.000Z`);
  return new Date(start.getTime() + offsetDays * MS_PER_DAY).toISOString();
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env' }), { status: 500 });
  }

  const payload = (await req.json()) as NewHirePayload;
  if (!payload.fullName?.trim() || !payload.email?.trim() || !payload.startDate) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', payload.email.trim().toLowerCase())
    .maybeSingle();

  if (existingProfile) {
    return new Response(JSON.stringify({ error: 'Email already exists' }), { status: 409 });
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: payload.email.trim().toLowerCase(),
    email_confirm: true,
    user_metadata: { full_name: payload.fullName.trim() },
  });

  if (authError || !authUser.user) {
    return new Response(JSON.stringify({ error: authError?.message ?? 'Auth user creation failed' }), {
      status: 500,
    });
  }

  const userId = authUser.user.id;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    full_name: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    role: payload.role ?? 'employee',
    department_id: payload.departmentId,
    manager_id: payload.managerId ?? null,
    start_date: payload.startDate,
    job_title: payload.jobTitle ?? null,
    photo_url: payload.photoUrl ?? null,
  });

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 500 });
  }

  let templateId = payload.templateId;
  if (!templateId) {
    const { data: templates } = await supabase
      .from('onboarding_templates')
      .select('id, target_role, target_department, active')
      .eq('active', true);

    const match =
      (templates ?? []).find(
        (t: { target_role: string | null; target_department: string | null }) =>
          t.target_role === (payload.role ?? 'employee') &&
          t.target_department &&
          payload.departmentId,
      ) ??
      (templates ?? []).find(
        (t: { target_role: string | null; target_department: string | null }) =>
          t.target_role === (payload.role ?? 'employee') && !t.target_department,
      );

    templateId = match?.id ?? null;
  }

  if (!templateId) {
    return new Response(JSON.stringify({ error: 'No matching onboarding template' }), { status: 400 });
  }

  const { data: plan, error: planError } = await supabase
    .from('onboarding_plans')
    .insert({ user_id: userId, template_id: templateId, status: 'active' })
    .select('id')
    .single();

  if (planError || !plan) {
    return new Response(JSON.stringify({ error: planError?.message ?? 'Plan creation failed' }), {
      status: 500,
    });
  }

  const { data: templateTasks, error: tasksError } = await supabase
    .from('template_tasks')
    .select('id, due_date_offset_days')
    .eq('template_id', templateId);

  if (tasksError) {
    return new Response(JSON.stringify({ error: tasksError.message }), { status: 500 });
  }

  const taskRows = (templateTasks ?? []).map((task: { id: string; due_date_offset_days: number }) => ({
    plan_id: plan.id,
    template_task_id: task.id,
    user_id: userId,
    status: 'pending',
    due_at: computeDueAt(payload.startDate, task.due_date_offset_days ?? 0),
  }));

  if (taskRows.length > 0) {
    const { error: progressError } = await supabase.from('task_progress').insert(taskRows);
    if (progressError) {
      return new Response(JSON.stringify({ error: progressError.message }), { status: 500 });
    }
  }

  await supabase.from('notifications').insert({
    user_id: userId,
    channel: 'in_app',
    status: 'sent',
    payload: {
      title: 'Welcome to EmHub',
      body: 'Your onboarding plan is ready. Sign in to get started.',
      type: 'onboarding',
      link: '/dashboard',
    },
  });

  return new Response(
    JSON.stringify({
      userId,
      planId: plan.id,
      tasksCreated: taskRows.length,
      templateId,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
