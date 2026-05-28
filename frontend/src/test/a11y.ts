import { configureAxe } from 'vitest-axe';

export const axe = configureAxe({
  rules: {
    region: { enabled: false },
  },
});
