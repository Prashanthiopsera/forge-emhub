-- WO-005: Development seed data (run via `supabase db reset` or `supabase db seed`)

BEGIN;

INSERT INTO public.departments (id, name, parent_department_id) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'Engineering', NULL),
  ('d1000000-0000-4000-8000-000000000002', 'People Operations', NULL),
  ('d1000000-0000-4000-8000-000000000003', 'Information Technology', NULL),
  ('d1000000-0000-4000-8000-000000000004', 'Platform', 'd1000000-0000-4000-8000-000000000001'),
  ('d1000000-0000-4000-8000-000000000005', 'Product', 'd1000000-0000-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  inst_id UUID;
  u RECORD;
BEGIN
  SELECT id INTO inst_id FROM auth.instances LIMIT 1;
  IF inst_id IS NULL THEN
    inst_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  FOR u IN
    SELECT * FROM (VALUES
      ('u1000000-0000-4000-8000-000000000001', 'alex.newhire@emhub.local', 'Alex Chen', 'employee'),
      ('u1000000-0000-4000-8000-000000000002', 'jordan.newhire@emhub.local', 'Jordan Lee', 'employee'),
      ('u1000000-0000-4000-8000-000000000003', 'sam.newhire@emhub.local', 'Sam Rivera', 'employee'),
      ('u1000000-0000-4000-8000-000000000004', 'taylor.newhire@emhub.local', 'Taylor Kim', 'employee'),
      ('u1000000-0000-4000-8000-000000000005', 'casey.newhire@emhub.local', 'Casey Morgan', 'employee'),
      ('u1000000-0000-4000-8000-000000000006', 'riley.newhire@emhub.local', 'Riley Nguyen', 'employee'),
      ('u1000000-0000-4000-8000-000000000007', 'avery.newhire@emhub.local', 'Avery Brooks', 'employee'),
      ('u1000000-0000-4000-8000-000000000008', 'quinn.newhire@emhub.local', 'Quinn Adams', 'employee'),
      ('u1000000-0000-4000-8000-000000000009', 'drew.newhire@emhub.local', 'Drew Patel', 'employee'),
      ('u1000000-0000-4000-8000-00000000000a', 'blake.newhire@emhub.local', 'Blake Turner', 'employee'),
      ('u1000000-0000-4000-8000-00000000000b', 'cameron.newhire@emhub.local', 'Cameron Diaz', 'employee'),
      ('u1000000-0000-4000-8000-00000000000c', 'skyler.newhire@emhub.local', 'Skyler Reed', 'employee'),
      ('u1000000-0000-4000-8000-000000000010', 'mgr.engineering@emhub.local', 'Morgan Blake', 'manager'),
      ('u1000000-0000-4000-8000-000000000011', 'mgr.product@emhub.local', 'Riley Park', 'manager'),
      ('u1000000-0000-4000-8000-000000000012', 'mgr.platform@emhub.local', 'Jamie Fox', 'manager'),
      ('u1000000-0000-4000-8000-000000000020', 'hr.admin@emhub.local', 'Maria Santos', 'hr_admin'),
      ('u1000000-0000-4000-8000-000000000021', 'hr.programs@emhub.local', 'Priya Nair', 'hr_admin'),
      ('u1000000-0000-4000-8000-000000000030', 'it.ops@emhub.local', 'Chris Ortiz', 'it_ops'),
      ('u1000000-0000-4000-8000-000000000031', 'it.provisioning@emhub.local', 'Dana Wells', 'it_ops'),
      ('u1000000-0000-4000-8000-000000000032', 'pat.employee@emhub.local', 'Pat Ellis', 'employee')
    ) AS t(id, email, full_name, role)
  LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    ) VALUES (
      inst_id, u.id::uuid, 'authenticated', 'authenticated', u.email,
      crypt('EmhubDev123!', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', u.full_name)
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, department_id, full_name, email, role, start_date, phone, photo_url)
    VALUES (
      u.id::uuid,
      CASE u.role
        WHEN 'manager' THEN 'd1000000-0000-4000-8000-000000000001'::uuid
        WHEN 'hr_admin' THEN 'd1000000-0000-4000-8000-000000000002'::uuid
        WHEN 'it_ops' THEN 'd1000000-0000-4000-8000-000000000003'::uuid
        ELSE 'd1000000-0000-4000-8000-000000000004'::uuid
      END,
      u.full_name,
      u.email,
      u.role::public.app_role,
      CURRENT_DATE - 7,
      '+1-555-0100',
      'https://example.com/avatars/default.png'
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;

  UPDATE public.profiles SET manager_id = 'u1000000-0000-4000-8000-000000000010'::uuid
    WHERE role = 'employee' AND department_id = 'd1000000-0000-4000-8000-000000000004'::uuid;
END $$;

INSERT INTO public.onboarding_templates (id, name, target_role, target_department, active) VALUES
  ('t1000000-0000-4000-8000-000000000001', 'Engineering IC — Standard', 'employee', 'Engineering', true),
  ('t1000000-0000-4000-8000-000000000002', 'Product IC — Standard', 'employee', 'Product', true),
  ('t1000000-0000-4000-8000-000000000003', 'All Departments — Day 1 Essentials', 'employee', NULL, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.template_tasks (id, template_id, title, phase_name, sort_order) VALUES
  ('tt100000-0000-4000-8000-00000000001', 't1000000-0000-4000-8000-000000000001', 'Complete security training', 'Day 1', 1),
  ('tt100000-0000-4000-8000-00000000002', 't1000000-0000-4000-8000-000000000001', 'Set up development environment', 'Week 1', 2),
  ('tt100000-0000-4000-8000-00000000003', 't1000000-0000-4000-8000-000000000003', 'Meet your manager', 'Day 1', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.faq_categories (id, name, slug) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'Benefits', 'benefits'),
  ('f1000000-0000-4000-8000-000000000002', 'IT Setup', 'it-setup')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.faq_articles (id, category_id, title, body, published, reviewed_at) VALUES
  ('fa100000-0000-4000-8000-00000000001', 'f1000000-0000-4000-8000-000000000001',
   'When does benefits enrollment start?', 'Enrollment opens on your start date and remains open for 30 days.', true, now()),
  ('fa100000-0000-4000-8000-00000000002', 'f1000000-0000-4000-8000-000000000002',
   'How do I request laptop provisioning?', 'Submit a ticket via the IT portal linked in your onboarding checklist.', true, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.org_chart_nodes (id, department_id, user_id, display_name, job_title, email) VALUES
  ('o1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'u1000000-0000-4000-8000-000000000020', 'Maria Santos', 'HR Director', 'hr.admin@emhub.local'),
  ('o1000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000001', 'u1000000-0000-4000-8000-000000000010', 'Morgan Blake', 'Engineering Manager', 'mgr.engineering@emhub.local'),
  ('o1000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000001', 'u1000000-0000-4000-8000-000000000001', 'Alex Chen', 'Software Engineer', 'alex.newhire@emhub.local')
ON CONFLICT (id) DO NOTHING;

-- WO-011: Personalized dashboard seed for alex.newhire (demo employee)
UPDATE public.profiles
SET job_title = 'Software Engineer'
WHERE id = 'u1000000-0000-4000-8000-000000000001'::uuid;

INSERT INTO public.onboarding_plans (id, user_id, template_id, status) VALUES
  (
    'p1000000-0000-4000-8000-000000000001',
    'u1000000-0000-4000-8000-000000000001',
    't1000000-0000-4000-8000-000000000001',
    'active'
  ),
  (
    'p1000000-0000-4000-8000-000000000002',
    'u1000000-0000-4000-8000-000000000001',
    't1000000-0000-4000-8000-000000000003',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.task_progress (id, plan_id, template_task_id, user_id, status, due_at, completed_at) VALUES
  (
    'tp100000-0000-4000-8000-00000000001',
    'p1000000-0000-4000-8000-000000000001',
    'tt100000-0000-4000-8000-00000000001',
    'u1000000-0000-4000-8000-000000000001',
    'completed',
    CURRENT_DATE,
    now()
  ),
  (
    'tp100000-0000-4000-8000-00000000002',
    'p1000000-0000-4000-8000-000000000001',
    'tt100000-0000-4000-8000-00000000002',
    'u1000000-0000-4000-8000-000000000001',
    'in_progress',
    CURRENT_DATE + 7,
    NULL
  ),
  (
    'tp100000-0000-4000-8000-00000000003',
    'p1000000-0000-4000-8000-000000000002',
    'tt100000-0000-4000-8000-00000000003',
    'u1000000-0000-4000-8000-000000000001',
    'pending',
    CURRENT_DATE,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
