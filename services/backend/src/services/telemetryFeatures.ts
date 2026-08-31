export const FEATURE_VERSION = 'telemetry-features-v1';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export interface TelemetryPoint {
  ts: Date;
  tempIn: number | null;
  humIn: number | null;
  weightKg: number | null;
  tempOut: number | null;
  batteryV: number | null;
}

export interface TelemetryFeatures {
  featureVersion: string;
  windowStart: Date;
  windowEnd: Date;
  latestReadingAt: Date | null;
  readingCount: number;
  tempInCount: number;
  humInCount: number;
  weightCount: number;
  tempOutCount: number;
  batteryCount: number;
  tempInLatest: number | null;
  tempInMean1h: number | null;
  tempInMin24h: number | null;
  tempInMax24h: number | null;
  tempInSlope1h: number | null;
  tempInStddev24h: number | null;
  humInLatest: number | null;
  humInMean1h: number | null;
  humInMin24h: number | null;
  humInMax24h: number | null;
  humInSlope1h: number | null;
  humInStddev24h: number | null;
  weightLatestKg: number | null;
  weightDelta1hKg: number | null;
  weightDelta24hKg: number | null;
  weightDelta7dKg: number | null;
  maxWeightDropPct1h: number | null;
  tempOutLatest: number | null;
  tempOutMean1h: number | null;
  batteryLatestV: number | null;
  batteryMin24hV: number | null;
  freshnessSeconds: number | null;
  dataQualityScore: number;
}

export function featureWindowEnd(timestamp: Date): Date {
  const value = timestamp.getTime();
  return new Date(Math.ceil(value / FIVE_MINUTES_MS) * FIVE_MINUTES_MS);
}

export function buildTelemetryFeatures(input: TelemetryPoint[], windowEnd: Date): TelemetryFeatures {
  const points = [...input]
    .filter((point) => point.ts <= windowEnd && point.ts > new Date(windowEnd.getTime() - 7 * DAY_MS))
    .sort((left, right) => left.ts.getTime() - right.ts.getTime());
  const hour = points.filter((point) => point.ts > new Date(windowEnd.getTime() - HOUR_MS));
  const day = points.filter((point) => point.ts > new Date(windowEnd.getTime() - DAY_MS));
  const latestReadingAt = day.at(-1)?.ts ?? null;

  const tempHour = series(hour, 'tempIn');
  const tempDay = series(day, 'tempIn');
  const humidityHour = series(hour, 'humIn');
  const humidityDay = series(day, 'humIn');
  const weightHour = series(hour, 'weightKg');
  const weightAll = series(points, 'weightKg');
  const outsideHour = series(hour, 'tempOut');
  const outsideDay = series(day, 'tempOut');
  const batteryHour = series(hour, 'batteryV');
  const batteryDay = series(day, 'batteryV');
  const freshnessSeconds = latestReadingAt
    ? Math.max(0, Math.floor((windowEnd.getTime() - latestReadingAt.getTime()) / 1000))
    : null;

  const freshnessCoverage = freshnessSeconds == null ? 0 : freshnessSeconds <= 15 * 60 ? 1 : freshnessSeconds <= 30 * 60 ? 0.5 : 0;
  const dataQualityScore = clamp(
    0.4 * freshnessCoverage +
    0.2 * coverage(tempHour.length, 12) +
    0.2 * coverage(humidityHour.length, 12) +
    0.15 * coverage(weightHour.length, 4) +
    0.05 * coverage(batteryHour.length, 2),
    0,
    1,
  );

  return {
    featureVersion: FEATURE_VERSION,
    windowStart: new Date(windowEnd.getTime() - DAY_MS),
    windowEnd,
    latestReadingAt,
    readingCount: day.length,
    tempInCount: tempHour.length,
    humInCount: humidityHour.length,
    weightCount: weightHour.length,
    tempOutCount: outsideHour.length,
    batteryCount: batteryHour.length,
    tempInLatest: latest(tempDay),
    tempInMean1h: mean(tempHour),
    tempInMin24h: minimum(tempDay),
    tempInMax24h: maximum(tempDay),
    tempInSlope1h: slopePerHour(tempHour),
    tempInStddev24h: standardDeviation(tempDay),
    humInLatest: latest(humidityDay),
    humInMean1h: mean(humidityHour),
    humInMin24h: minimum(humidityDay),
    humInMax24h: maximum(humidityDay),
    humInSlope1h: slopePerHour(humidityHour),
    humInStddev24h: standardDeviation(humidityDay),
    weightLatestKg: latest(weightAll),
    weightDelta1hKg: horizonDelta(weightAll, windowEnd, HOUR_MS, 30 * 60 * 1000),
    weightDelta24hKg: horizonDelta(weightAll, windowEnd, DAY_MS, 2 * HOUR_MS),
    weightDelta7dKg: horizonDelta(weightAll, windowEnd, 7 * DAY_MS, 12 * HOUR_MS),
    maxWeightDropPct1h: maxAdjacentWeightDrop(weightHour),
    tempOutLatest: latest(outsideDay),
    tempOutMean1h: mean(outsideHour),
    batteryLatestV: latest(batteryDay),
    batteryMin24hV: minimum(batteryDay),
    freshnessSeconds,
    dataQualityScore,
  };
}

type Channel = 'tempIn' | 'humIn' | 'weightKg' | 'tempOut' | 'batteryV';
type ValuePoint = { ts: Date; value: number };

function series(points: TelemetryPoint[], channel: Channel): ValuePoint[] {
  return points.flatMap((point) => point[channel] == null ? [] : [{ ts: point.ts, value: point[channel] }]);
}

function latest(values: ValuePoint[]): number | null { return values.at(-1)?.value ?? null; }
function mean(values: ValuePoint[]): number | null {
  return values.length ? values.reduce((sum, point) => sum + point.value, 0) / values.length : null;
}
function minimum(values: ValuePoint[]): number | null {
  return values.length ? Math.min(...values.map((point) => point.value)) : null;
}
function maximum(values: ValuePoint[]): number | null {
  return values.length ? Math.max(...values.map((point) => point.value)) : null;
}
function standardDeviation(values: ValuePoint[]): number | null {
  const average = mean(values);
  if (average == null) return null;
  return Math.sqrt(values.reduce((sum, point) => sum + (point.value - average) ** 2, 0) / values.length);
}
function slopePerHour(values: ValuePoint[]): number | null {
  if (values.length < 2) return null;
  const origin = values[0].ts.getTime();
  const samples = values.map((point) => ({ x: (point.ts.getTime() - origin) / HOUR_MS, y: point.value }));
  const meanX = samples.reduce((sum, point) => sum + point.x, 0) / samples.length;
  const meanY = samples.reduce((sum, point) => sum + point.y, 0) / samples.length;
  const numerator = samples.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0);
  const denominator = samples.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  return denominator === 0 ? null : numerator / denominator;
}
function horizonDelta(values: ValuePoint[], end: Date, horizonMs: number, toleranceMs: number): number | null {
  const current = values.filter((point) => point.ts <= end).at(-1);
  if (!current) return null;
  const target = end.getTime() - horizonMs;
  const baseline = values.filter((point) => point.ts.getTime() <= target).at(-1);
  if (!baseline || target - baseline.ts.getTime() > toleranceMs) return null;
  return current.value - baseline.value;
}
function maxAdjacentWeightDrop(values: ValuePoint[]): number | null {
  let maximumDrop: number | null = null;
  for (let index = 1; index < values.length; index += 1) {
    const previous = values[index - 1];
    const current = values[index];
    if (previous.value <= 0 || current.ts.getTime() - previous.ts.getTime() > HOUR_MS) continue;
    const drop = Math.max(0, (previous.value - current.value) / previous.value);
    maximumDrop = maximumDrop == null ? drop : Math.max(maximumDrop, drop);
  }
  return maximumDrop;
}
function coverage(actual: number, expected: number): number { return Math.min(actual / expected, 1); }
function clamp(value: number, min: number, max: number): number { return Math.min(max, Math.max(min, value)); }
