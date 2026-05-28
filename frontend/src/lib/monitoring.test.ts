import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  exceedsErrorRateThreshold,
  getErrorBuffer,
  p95LoadTimeMs,
  recordErrorReport,
  recordPerformanceSnapshot,
  reportError,
  resetMonitoringBuffersForTests,
} from '@/lib/monitoring';

describe('monitoring (WO-033)', () => {
  beforeEach(() => {
    resetMonitoringBuffersForTests();
  });

  it('buffers performance snapshots and computes P95', () => {
    for (let index = 0; index < 20; index += 1) {
      recordPerformanceSnapshot({
        page: '/dashboard',
        loadTimeMs: index < 19 ? 500 : 2500,
        domContentLoadedMs: 400,
        largestContentfulPaintMs: null,
        cumulativeLayoutShift: null,
        capturedAt: new Date().toISOString(),
      });
    }

    expect(p95LoadTimeMs()).toBe(2500);
  });

  it('records errors from reportError', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    reportError(new Error('Test failure'), 'at Component');
    expect(getErrorBuffer().some((entry) => entry.message === 'Test failure')).toBe(true);
    consoleError.mockRestore();
  });

  it('flags elevated error rate', () => {
    for (let index = 0; index < 5; index += 1) {
      recordErrorReport({
        message: `error-${index}`,
        page: '/checklist',
        capturedAt: new Date().toISOString(),
      });
    }
    expect(exceedsErrorRateThreshold()).toBe(true);
  });
});
