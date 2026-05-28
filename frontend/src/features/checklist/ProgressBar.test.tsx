import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from '@/features/checklist/ProgressBar';

describe('ProgressBar (WO-012)', () => {
  it('renders percent and progressbar aria values', () => {
    render(<ProgressBar percent={40} />);

    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  });

  it('clamps values above 100', () => {
    render(<ProgressBar percent={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
