/** @param {number[]} values */
export function percentile(values, p) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

/** @param {number[]} values */
export function summarizeNumbers(values) {
  const numeric = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (numeric.length === 0) {
    return {
      count: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      p75: null,
      p95: null,
    };
  }

  const sum = numeric.reduce((total, value) => total + value, 0);
  return {
    count: numeric.length,
    min: Math.min(...numeric),
    max: Math.max(...numeric),
    mean: round(sum / numeric.length),
    median: round(percentile(numeric, 0.5)),
    p75: round(percentile(numeric, 0.75)),
    p95: round(percentile(numeric, 0.95)),
  };
}

export function round(value, digits = 2) {
  if (typeof value !== "number" || !Number.isFinite(value)) return value;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function countBy(values) {
  const counts = {};
  for (const value of values) {
    const key = String(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
