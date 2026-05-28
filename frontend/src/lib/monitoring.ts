/**
 * WO-033: Client-side APM and error reporting (dev buffer + console; production hook point).
 */

export interface PerformanceSnapshot {
  page: string;
  loadTimeMs: number;
  domContentLoadedMs: number;
  largestContentfulPaintMs: number | null;
  cumulativeLayoutShift: number | null;
  capturedAt: string;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  page: string;
  capturedAt: string;
}

const P95_LOAD_THRESHOLD_MS = 2000;
const ERROR_RATE_THRESHOLD = 0.01;

const performanceBuffer: PerformanceSnapshot[] = [];
const errorBuffer: ErrorReport[] = [];
let sessionEventCount = 0;

function currentPage(): string {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

export function recordPerformanceSnapshot(snapshot: PerformanceSnapshot): void {
  performanceBuffer.push(snapshot);
  if (performanceBuffer.length > 100) performanceBuffer.shift();

  if (snapshot.loadTimeMs > P95_LOAD_THRESHOLD_MS) {
    console.warn('[APM] P95 page load SLO breach', snapshot);
  }
}

export function recordErrorReport(report: ErrorReport): void {
  errorBuffer.push(report);
  if (errorBuffer.length > 100) errorBuffer.shift();
  sessionEventCount += 1;
  console.error('[APM] Uncaught error', report);
}

export function getPerformanceBuffer(): readonly PerformanceSnapshot[] {
  return performanceBuffer;
}

export function getErrorBuffer(): readonly ErrorReport[] {
  return errorBuffer;
}

export function errorRate(): number {
  if (sessionEventCount === 0) return 0;
  return errorBuffer.length / Math.max(sessionEventCount, 1);
}

export function exceedsErrorRateThreshold(): boolean {
  return errorRate() > ERROR_RATE_THRESHOLD;
}

export function p95LoadTimeMs(): number {
  if (performanceBuffer.length === 0) return 0;
  const sorted = [...performanceBuffer.map((s) => s.loadTimeMs)].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((sorted.length - 1) * 0.95));
  return sorted[index] ?? 0;
}

function readLcp(): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof PerformanceObserver === 'undefined') {
      resolve(null);
      return;
    }

    let lcp: number | null = null;
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry & { startTime?: number };
        if (last?.startTime != null) lcp = last.startTime;
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      window.setTimeout(() => {
        observer.disconnect();
        resolve(lcp);
      }, 500);
    } catch {
      resolve(null);
    }
  });
}

function readCls(): number | null {
  if (typeof PerformanceObserver === 'undefined') return null;

  let cls = 0;
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value?: number; hadRecentInput?: boolean })[]) {
        if (!entry.hadRecentInput && entry.value != null) cls += entry.value;
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
    window.setTimeout(() => observer.disconnect(), 500);
  } catch {
    return null;
  }
  return cls;
}

/** Captures navigation timing and Web Vitals after load. */
export async function capturePagePerformance(): Promise<PerformanceSnapshot | null> {
  if (typeof window === 'undefined' || !window.performance?.timing) return null;

  sessionEventCount += 1;
  const timing = window.performance.timing;
  const loadTimeMs = timing.loadEventEnd - timing.navigationStart;
  const domContentLoadedMs = timing.domContentLoadedEventEnd - timing.navigationStart;

  const [lcp, cls] = await Promise.all([readLcp(), Promise.resolve(readCls())]);

  const snapshot: PerformanceSnapshot = {
    page: currentPage(),
    loadTimeMs: Math.max(0, loadTimeMs),
    domContentLoadedMs: Math.max(0, domContentLoadedMs),
    largestContentfulPaintMs: lcp,
    cumulativeLayoutShift: cls,
    capturedAt: new Date().toISOString(),
  };

  recordPerformanceSnapshot(snapshot);
  return snapshot;
}

export function reportError(error: Error, componentStack?: string): void {
  recordErrorReport({
    message: error.message,
    stack: error.stack,
    componentStack,
    page: currentPage(),
    capturedAt: new Date().toISOString(),
  });
}

/** Clears in-memory APM buffers (tests only). */
export function resetMonitoringBuffersForTests(): void {
  performanceBuffer.length = 0;
  errorBuffer.length = 0;
  sessionEventCount = 0;
}

export function initMonitoring(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    void capturePagePerformance();
  });

  window.addEventListener('error', (event) => {
    reportError(event.error instanceof Error ? event.error : new Error(event.message));
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportError(reason instanceof Error ? reason : new Error(String(reason)));
  });
}
