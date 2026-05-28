import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductTour } from '@/features/tour/ProductTour';

vi.mock('@/features/tour/useProductTour', () => ({
  useProductTour: vi.fn(),
}));

import { useProductTour } from '@/features/tour/useProductTour';

const mockUseProductTour = vi.mocked(useProductTour);

describe('ProductTour (WO-029)', () => {
  it('renders tour dialog with step content', () => {
    mockUseProductTour.mockReturnValue({
      active: true,
      stepIndex: 0,
      currentStep: {
        path: '/dashboard',
        label: 'Dashboard',
        description: 'Your personalized onboarding roadmap and next actions.',
      },
      isLastStep: false,
      totalSteps: 5,
      nextStep: vi.fn(),
      skipTour: vi.fn(),
    });

    render(<ProductTour />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('calls nextStep when Next is clicked', () => {
    const nextStep = vi.fn();

    mockUseProductTour.mockReturnValue({
      active: true,
      stepIndex: 0,
      currentStep: {
        path: '/dashboard',
        label: 'Dashboard',
        description: 'Roadmap',
      },
      isLastStep: false,
      totalSteps: 5,
      nextStep,
      skipTour: vi.fn(),
    });

    render(<ProductTour />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(nextStep).toHaveBeenCalled();
  });
});
