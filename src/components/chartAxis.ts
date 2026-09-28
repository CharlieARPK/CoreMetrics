/** Keep the latest measurement at the right edge, including single-point histories. */
export function getChartAxis(timestamps: number[]) {
  const valid = timestamps.filter(Number.isFinite);
  if (!valid.length) return { domain: [0, 1] as [number, number], ticks: [0, 1] };
  const first = valid.reduce((a, b) => Math.min(a, b));
  const last = valid.reduce((a, b) => Math.max(a, b));
  const start = first === last ? last - 86400000 : first;
  const middle = start + (last - start) / 2;
  return { domain: [start, last] as [number, number], ticks: [start, middle, last] };
}
