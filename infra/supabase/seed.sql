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
  ('tt100000-0000-4000-8000-00000000002', 't1000000-0000-4000-8000-000000000001', 'Set up development environment', 'Week 1', 1),
  ('tt100000-0000-4000-8000-00000000003', 't1000000-0000-4000-8000-000000000003', 'Meet your manager', 'Day 1', 2),
  ('tt100000-0000-4000-8000-00000000004', 't1000000-0000-4000-8000-000000000001', 'Shadow a team standup', 'Week 1', 2),
  ('tt100000-0000-4000-8000-00000000005', 't1000000-0000-4000-8000-000000000001', 'Complete 30-day goals review', 'Month 1', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.faq_categories (id, name, slug) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'Benefits', 'benefits'),
  ('f1000000-0000-4000-8000-000000000002', 'IT Setup', 'it-setup'),
  ('f1000000-0000-4000-8000-000000000003', 'Onboarding', 'onboarding'),
  ('f1000000-0000-4000-8000-000000000004', 'Payroll', 'payroll'),
  ('f1000000-0000-4000-8000-000000000005', 'Policies', 'policies')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.faq_articles (id, category_id, title, body, published, reviewed_at) VALUES
  ('fa100000-0000-4000-8000-00000000001', 'f1000000-0000-4000-8000-000000000001',
   'When does benefits enrollment start?', 'Enrollment opens on your start date and remains open for 30 days.', true, now()),
  ('fa100000-0000-4000-8000-00000000002', 'f1000000-0000-4000-8000-000000000002',
   'How do I request laptop provisioning?', 'Submit a ticket via the IT portal linked in your onboarding checklist.', true, now()),
  ('fa100000-0000-4000-8000-00000000003', 'f1000000-0000-4000-8000-000000000001',
   'What health plans are available?', 'We offer PPO, HMO, and high-deductible plans with HSA options. Compare plans in the benefits portal.', true, now()),
  ('fa100000-0000-4000-8000-00000000004', 'f1000000-0000-4000-8000-000000000001',
   'How do I add dependents to my coverage?', 'Add dependents during initial enrollment or within 30 days of a qualifying life event.', true, now()),
  ('fa100000-0000-4000-8000-00000000005', 'f1000000-0000-4000-8000-000000000001',
   'When does dental and vision coverage begin?', 'Dental and vision coverage start on the first day of the month following your start date.', true, now()),
  ('fa100000-0000-4000-8000-00000000006', 'f1000000-0000-4000-8000-000000000002',
   'How do I set up multi-factor authentication?', 'MFA is required for all employees. Enroll from your profile security settings or during first login.', true, now()),
  ('fa100000-0000-4000-8000-00000000007', 'f1000000-0000-4000-8000-000000000002',
   'Which Wi-Fi network should I use in the office?', 'Connect to EmHub-Corp using your corporate credentials. Guest Wi-Fi is for visitors only.', true, now()),
  ('fa100000-0000-4000-8000-00000000008', 'f1000000-0000-4000-8000-000000000002',
   'How do I install approved software?', 'Use the self-service software catalog in the IT portal. Admin rights are not required for catalog apps.', true, now()),
  ('fa100000-0000-4000-8000-00000000009', 'f1000000-0000-4000-8000-000000000003',
   'Where is my onboarding checklist?', 'Open the Checklist page from the sidebar to view tasks assigned to your role and department.', true, now()),
  ('fa100000-0000-4000-8000-0000000000a', 'f1000000-0000-4000-8000-000000000003',
   'Who is my onboarding buddy?', 'Your buddy is listed in your welcome email and on the Dashboard under your manager contact.', true, now()),
  ('fa100000-0000-4000-8000-0000000000b', 'f1000000-0000-4000-8000-000000000003',
   'What training is required in week one?', 'Complete security awareness, code of conduct, and role-specific modules listed under Training.', true, now()),
  ('fa100000-0000-4000-8000-0000000000c', 'f1000000-0000-4000-8000-000000000003',
   'How do I schedule a 30-day check-in?', 'Your manager will send a calendar invite. You can also request one via the onboarding checklist.', true, now()),
  ('fa100000-0000-4000-8000-0000000000d', 'f1000000-0000-4000-8000-000000000004',
   'When is my first paycheck?', 'Payroll runs biweekly on Fridays. Your first paycheck arrives on the second pay date after start.', true, now()),
  ('fa100000-0000-4000-8000-0000000000e', 'f1000000-0000-4000-8000-000000000004',
   'How do I set up direct deposit?', 'Add your bank details in the payroll self-service portal within your first week.', true, now()),
  ('fa100000-0000-4000-8000-0000000000f', 'f1000000-0000-4000-8000-000000000004',
   'Where can I download pay stubs?', 'Pay stubs are available in the payroll portal under Documents after each pay period closes.', true, now()),
  ('fa100000-0000-4000-8000-00000000010', 'f1000000-0000-4000-8000-000000000004',
   'How are expense reimbursements processed?', 'Submit expenses through the finance portal. Approved reimbursements appear on the next payroll cycle.', true, now()),
  ('fa100000-0000-4000-8000-00000000011', 'f1000000-0000-4000-8000-000000000005',
   'What is the remote work policy?', 'Hybrid employees may work remotely up to three days per week with manager approval.', true, now()),
  ('fa100000-0000-4000-8000-00000000012', 'f1000000-0000-4000-8000-000000000005',
   'How much PTO do new hires receive?', 'New hires accrue 15 days of PTO per year, prorated from your start date.', true, now()),
  ('fa100000-0000-4000-8000-00000000013', 'f1000000-0000-4000-8000-000000000005',
   'What is the dress code?', 'Business casual is the default. Client-facing meetings may require business attire.', true, now()),
  ('fa100000-0000-4000-8000-00000000014', 'f1000000-0000-4000-8000-000000000005',
   'How do I report a workplace concern?', 'Contact HR confidentially via the ethics hotline or your People Operations partner.', true, now()),
  ('fa100000-0000-4000-8000-00000000015', 'f1000000-0000-4000-8000-000000000002',
   'How do I reset my corporate password?', 'Use the self-service password reset link on the login page or contact IT Ops for assistance.', true, now()),
  ('fa100000-0000-4000-8000-00000000016', 'f1000000-0000-4000-8000-000000000001',
   'Does the company offer a 401(k) match?', 'Yes. We match 100% of contributions up to 4% of salary after 90 days of employment.', true, now())
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
    CURRENT_DATE - 3,
    NULL
  ),
  (
    'tp100000-0000-4000-8000-00000000004',
    'p1000000-0000-4000-8000-000000000001',
    'tt100000-0000-4000-8000-00000000004',
    'u1000000-0000-4000-8000-000000000001',
    'pending',
    CURRENT_DATE + 5,
    NULL
  ),
  (
    'tp100000-0000-4000-8000-00000000005',
    'p1000000-0000-4000-8000-000000000001',
    'tt100000-0000-4000-8000-00000000005',
    'u1000000-0000-4000-8000-000000000001',
    'pending',
    CURRENT_DATE + 28,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- WO-016: Training video catalog seed (5 modules, mixed progress for alex.newhire)
INSERT INTO public.training_modules (
  id, title, description, category, video_provider, video_external_id, duration_seconds, required
) VALUES
  (
    'm1000000-0000-4000-8000-000000000001',
    'Welcome to Our Culture',
    'Learn about our mission, values, and how teams collaborate across the company.',
    'Company Culture',
    'vimeo',
    '76979871',
    600,
    true
  ),
  (
    'm1000000-0000-4000-8000-000000000002',
    'Secure Your Workspace',
    'Set up MFA, device encryption, and safe handling of company data.',
    'IT Setup',
    'wistia',
    'delib3hsz3',
    480,
    true
  ),
  (
    'm1000000-0000-4000-8000-000000000003',
    'Workplace Policies',
    'Review code of conduct, PTO, and reporting expectations.',
    'Policies',
    'vimeo',
    '148751763',
    720,
    true
  ),
  (
    'm1000000-0000-4000-8000-000000000004',
    'Role Essentials for Engineers',
    'Development workflow, code review norms, and on-call basics.',
    'Role-Specific',
    'wistia',
    '5qxpj8z2lc',
    540,
    true
  ),
  (
    'm1000000-0000-4000-8000-000000000005',
    'Diversity & Inclusion',
    'Building an inclusive team culture and allyship in daily work.',
    'Company Culture',
    'vimeo',
    '357126023',
    360,
    false
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.video_progress (id, module_id, user_id, watched_seconds, completed) VALUES
  (
    'vp100000-0000-4000-8000-00000000001',
    'm1000000-0000-4000-8000-000000000001',
    'u1000000-0000-4000-8000-000000000001',
    600,
    true
  ),
  (
    'vp100000-0000-4000-8000-00000000002',
    'm1000000-0000-4000-8000-000000000002',
    'u1000000-0000-4000-8000-000000000001',
    240,
    false
  ),
  (
    'vp100000-0000-4000-8000-00000000003',
    'm1000000-0000-4000-8000-000000000003',
    'u1000000-0000-4000-8000-000000000001',
    72,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- WO-030: In-app notification seeds for test users
INSERT INTO public.notifications (id, user_id, channel, target_role, status, payload) VALUES
  (
    'n1000000-0000-4000-8000-000000000001',
    'u1000000-0000-4000-8000-000000000001',
    'in_app',
    NULL,
    'sent',
    '{"title": "Welcome to EmHub", "body": "Complete your Day 1 checklist to get started.", "type": "onboarding", "link": "/dashboard"}'::jsonb
  ),
  (
    'n1000000-0000-4000-8000-000000000002',
    'u1000000-0000-4000-8000-000000000001',
    'in_app',
    NULL,
    'sent',
    '{"title": "Security training due", "body": "Finish security training before your first sprint.", "type": "task", "link": "/dashboard"}'::jsonb
  ),
  (
    'n1000000-0000-4000-8000-000000000003',
    'u1000000-0000-4000-8000-000000000001',
    'in_app',
    NULL,
    'read',
    '{"title": "Manager intro scheduled", "body": "Your manager meeting is on the calendar for tomorrow.", "type": "calendar"}'::jsonb
  ),
  (
    'n1000000-0000-4000-8000-000000000010',
    'u1000000-0000-4000-8000-000000000020',
    'in_app',
    NULL,
    'sent',
    '{"title": "New hire batch ready", "body": "12 employees started onboarding plans this week.", "type": "hr"}'::jsonb
  ),
  (
    'n1000000-0000-4000-8000-000000000020',
    'u1000000-0000-4000-8000-000000000030',
    'in_app',
    NULL,
    'sent',
    '{"title": "Laptop provisioning queue", "body": "3 devices are waiting for shipment confirmation.", "type": "provisioning"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
