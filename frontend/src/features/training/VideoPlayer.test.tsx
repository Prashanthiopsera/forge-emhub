import { render, screen, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TRAINING_MODULE_FIXTURES } from '@/features/training/training.fixtures';
import { mergeModuleProgress } from '@/features/training/training.logic';
import { PROGRESS_TICK_SECONDS, VideoPlayer } from '@/features/training/VideoPlayer';

describe('VideoPlayer (WO-016)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an iframe embed with resume time in the URL', () => {
    const [module] = mergeModuleProgress(TRAINING_MODULE_FIXTURES, [
      { moduleId: TRAINING_MODULE_FIXTURES[1].id, watchedSeconds: 120, completed: false },
    ]).filter((item) => item.id === TRAINING_MODULE_FIXTURES[1].id);

    render(<VideoPlayer module={module} onProgress={vi.fn()} />);

    const iframe = screen.getByTitle(`Training video: ${module.title}`);
    expect(iframe).toHaveAttribute('src', expect.stringContaining('time=120'));
    expect(iframe).toHaveAttribute('allow', expect.stringContaining('fullscreen'));
  });

  it('reports progress on interval while playing', () => {
    vi.useFakeTimers();
    const onProgress = vi.fn();
    const [module] = mergeModuleProgress(TRAINING_MODULE_FIXTURES, []);

    render(<VideoPlayer module={module} onProgress={onProgress} />);

    act(() => {
      vi.advanceTimersByTime(PROGRESS_TICK_SECONDS * 1000);
    });

    expect(onProgress).toHaveBeenCalledWith(PROGRESS_TICK_SECONDS);
  });
});
