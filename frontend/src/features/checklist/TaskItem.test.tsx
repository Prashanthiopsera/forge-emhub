import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildChecklistFixture } from '@/features/checklist/checklist.fixtures';
import { TaskItem } from '@/features/checklist/TaskItem';

describe('TaskItem (WO-012)', () => {
  const tasks = buildChecklistFixture().tasks;

  it('shows completed styling and hides mark complete for done tasks', () => {
    const completed = tasks.find((t) => t.status === 'completed')!;
    render(<TaskItem task={completed} onComplete={vi.fn()} />);

    expect(screen.getByText('Complete security training')).toHaveClass('line-through');
    expect(screen.queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
  });

  it('highlights overdue tasks in red with days overdue', () => {
    const overdue = tasks.find((t) => t.title === 'Meet your manager')!;
    render(<TaskItem task={overdue} />);

    expect(screen.getByText(/days overdue/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('text-red-700');
  });

  it('calls onComplete when mark complete is clicked', () => {
    const pending = tasks.find((t) => t.status === 'in_progress')!;
    const onComplete = vi.fn();

    render(<TaskItem task={pending} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark complete' }));

    expect(onComplete).toHaveBeenCalledWith(pending.id);
  });
});
