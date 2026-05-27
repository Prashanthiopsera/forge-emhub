import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the welcome page at the root route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Welcome aboard' })).toBeInTheDocument();
    expect(screen.getByText(/Employee Onboarding Hub/i)).toBeInTheDocument();
  });
});
