/**
 * Rule-based anti-adulteration checks (mirrors the Go chaincode logic).
 * These run server-side at Output Test submission and are used to enrich the
 * on-chain FLAG decision and to render plain-language integrity status on the
 * consumer verify page.
 */

export interface QualityTestInput {
  stage: 'INTAKE' | 'OUTPUT' | 'FINAL';
  moisture: number;
  hmf: number;
  diastase: number;
  sugarProfile: { fructose: number; glucose: number; sucrose: number };
  isotopeRatio: number;
}

export interface FraudCheckResult {
  passed: boolean;
  reasons: string[];
}

const MASS_BALANCE_TOLERANCE = 1.02; // output must not exceed intake by >2%

// Compositional drift tolerances (match chaincode defaults).
export const DRIFT_TOLERANCES = {
  moistureDelta: 0.5,
  hmfDelta: 8.0,
  diastaseDelta: 3.0,
  sugarProfileDelta: 0.3,
  isotopeDelta: 0.3,
};

/**
 * Mass-balance check: material can only ever decrease through processing; a >2%
 * gain in output vs intake is a strong dilution/adulteration signal.
 */
export function checkMassBalance(weightIn: number, weightOut: number): FraudCheckResult {
  const reasons: string[] = [];
  let passed = true;
  if (weightIn > 0 && weightOut > weightIn * MASS_BALANCE_TOLERANCE) {
    passed = false;
    reasons.push(`Mass-balance violation: output ${weightOut}kg exceeds intake ${weightIn}kg by >2%`);
  }
  return { passed, reasons };
}

/**
 * Compositional drift check comparing intake vs output lab panels. Any parameter
 * beyond its tolerance triggers a flag.
 */
export function checkCompositionalDrift(
  intake: QualityTestInput,
  output: QualityTestInput,
): FraudCheckResult {
  const reasons: string[] = [];
  let passed = true;
  const t = DRIFT_TOLERANCES;

  if (Math.abs(output.moisture - intake.moisture) > t.moistureDelta) {
    passed = false;
    reasons.push(`Compositional drift: moisture ${intake.moisture} -> ${output.moisture}`);
  }
  if (Math.abs(output.hmf - intake.hmf) > t.hmfDelta) {
    passed = false;
    reasons.push(`Compositional drift: HMF ${intake.hmf} -> ${output.hmf}`);
  }
  if (Math.abs(output.diastase - intake.diastase) > t.diastaseDelta) {
    passed = false;
    reasons.push(`Compositional drift: diastase ${intake.diastase} -> ${output.diastase}`);
  }
  if (Math.abs(output.isotopeRatio - intake.isotopeRatio) > t.isotopeDelta) {
    passed = false;
    reasons.push(`Compositional drift: C4 isotope ratio ${intake.isotopeRatio} -> ${output.isotopeRatio}`);
  }
  for (const comp of ['fructose', 'glucose', 'sucrose'] as const) {
    const a = intake.sugarProfile[comp];
    const b = output.sugarProfile[comp];
    if (a != null && b != null && Math.abs(b - a) > t.sugarProfileDelta) {
      passed = false;
      reasons.push(`Compositional drift: sugar '${comp}' ${a} -> ${b}`);
    }
  }
  return { passed, reasons };
}

/** Combined check (mass-balance + compositional drift). */
export function runFraudChecks(
  weightIn: number,
  weightOut: number,
  intake?: QualityTestInput,
  output?: QualityTestInput,
): FraudCheckResult {
  const reasons: string[] = [];
  let passed = true;

  const mass = checkMassBalance(weightIn, weightOut);
  if (!mass.passed) {
    passed = false;
    reasons.push(...mass.reasons);
  }

  if (intake && output) {
    const drift = checkCompositionalDrift(intake, output);
    if (!drift.passed) {
      passed = false;
      reasons.push(...drift.reasons);
    }
  }

  return { passed, reasons };
}
