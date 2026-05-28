import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as monitoring from '@/lib/monitoring';
import { ErrorBoundary } from './ErrorBoundary';

function ThrowingChild(): never {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>Child content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    const reportError = vi.spyOn(monitoring, 'reportError').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(reportError).toHaveBeenCalled();
    reportError.mockRestore();
  });
});
