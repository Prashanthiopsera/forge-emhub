import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlaceholderPage } from './PlaceholderPage';

describe('PlaceholderPage', () => {
  it('renders title and description', () => {
    render(<PlaceholderPage title="Dashboard" description="Your onboarding overview." />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Your onboarding overview.')).toBeInTheDocument();
  });
});
