/** localStorage key — product tour dismissed or completed (WO-029). */
export const TOUR_STORAGE_KEY = 'emhub_product_tour_completed';

/** Template task phase_name used as auto-complete event identifier. */
export const TOUR_COMPLETE_EVENT = 'tour_complete';

/** Five core nav destinations highlighted on first login. */
export const TOUR_STEPS = [
  { path: '/dashboard', label: 'Dashboard', description: 'Your personalized onboarding roadmap and next actions.' },
  { path: '/checklist', label: 'Checklist', description: 'Complete assigned tasks across Day 1, Week 1, and Month 1.' },
  { path: '/training', label: 'Training', description: 'Watch required videos; progress saves automatically.' },
  { path: '/org-chart', label: 'Org Chart', description: 'Explore team structure and reporting lines.' },
  { path: '/faq', label: 'FAQ', description: 'Search answers to common onboarding questions.' },
] as const;
