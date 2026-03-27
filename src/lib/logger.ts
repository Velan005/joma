export function logPerf(label: string, startMs: number) {
  const elapsed = Date.now() - startMs;
  if (elapsed > 1000) {
    console.warn(`[SLOW] ${label} took ${elapsed}ms`);
  } else {
    console.log(`[PERF] ${label} took ${elapsed}ms`);
  }
}
