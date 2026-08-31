// Compositional drift tolerances used by the OUTPUT-stage anti-fraud checks
// (mirrors services/backend/src/services/fraudChecks.ts).
export const DRIFT = {
  moistureDelta: 0.5,
  hmfDelta: 8.0,
  diastaseDelta: 3.0,
  sugarProfileDelta: 0.3,
  isotopeDelta: 0.3,
};