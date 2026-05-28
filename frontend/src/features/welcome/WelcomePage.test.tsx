import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { WelcomePage } from './WelcomePage';

describe('WelcomePage', () => {
  it('renders welcome content and auth links', () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Welcome aboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/signup');
  });
});
