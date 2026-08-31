import { config } from '../config.js';

// Structured output the LLM provider is asked to produce. We keep it loose and
// defensive: the caller must tolerate missing/extra keys. The narrative is the
// only part guaranteed to exist.
export interface LlmAnalysis {
  // Whether the telemetry/context suggests any bee disease or pest may be
  // present or developing. "false" means no disease is suspected.
  diseasePossible: boolean;
  possibleDiseases: Array<{ name: string; likelihood: 'low' | 'medium' | 'high'; note?: string }>;
  recommendedActions: string[];
  summary: string;
}

export interface LlmContext {
  hiveName: string;
  hiveId: string;
  beeSpecies: string;
  nectarSource: string;
  status: string;
  telemetryConditionScore: number | null;
  dataQualityLabel: string;
  latestReading: {
    temperature?: number | null;
    humidity?: number | null;
    weight?: number | null;
    battery?: number | null;
  };
  indicators: {
    temperature: string;
    humidity: string;
    weightChange: string;
    battery: string;
  };
  riskScores: RiskScoreMap;
  reasons: string[];
}

interface RiskScoreMap {
  environment?: number;
  swarming?: number;
  queenLoss?: number;
  diseasePest?: number;
  productivity?: number;
  device?: number;
  [key: string]: number | undefined;
}

export function llmConfigured(): boolean {
  return Boolean(config.OPENROUTER_API_KEY);
}

/**
 * Ask OpenRouter to interpret a hive's abnormal condition and produce a
 * beekeeper-friendly disease/pest analysis. Returns null when the provider is
 * not configured or the request fails so callers can degrade gracefully.
 */
export async function analyzeWithLlm(
  context: LlmContext,
  options: { timeoutMs?: number; model?: string } = {},
): Promise<LlmAnalysis | null> {
  const apiKey = config.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = options.model ?? config.OPENROUTER_MODEL;
  const baseUrl = config.OPENROUTER_BASE_URL.replace(/\/$/, '');
  const timeoutMs = options.timeoutMs ?? 15_000;

  const system = [
    'You are a senior apicultural advisor for the HoneyChain platform, an IoT hive-monitoring',
    'and honey supply-chain program. A beekeeper relies on a hive monitor that records ambient',
    'temperature (°C), humidity (%), hive weight (kg) and battery voltage (V), plus a stream of',
    'computed risk scores and condition indicators.',
    '',
    'Your task is to interpret a specific hive that has drifted outside its normal operating band',
    'and decide whether any bee disease or pest (or colony condition) is plausibly developing.',
    '',
    'KEY RULE: This is a RISK ESTIMATION / screening, NEVER a definitive diagnosis. A hive monitor',
    'cannot see the brood or bees, so you must weigh signs conservatively and flag uncertainty.',
    'Base the exact interpretation ONLY on the telemetry, indicators, risk scores, bee species and',
    'floral source you are given. Do not invent sensor readings.',
    '',
    'First state clearly whether any disease is possible (diseasePossible: true/false):',
    '- If the evidence strongly suggests a healthy colony (stable temperature, mild humidity, no',
    '  abnormal weight loss, no concerning risk scores), set diseasePossible=false and keep',
    '  possibleDiseases empty (or with only low-likelihood "watch" notes).',
    '- If there is a plausible signal — e.g. sharp weight loss, temperature far out of range,',
    '  elevated disease/pest risk, swarming behaviour — set diseasePossible=true and list which',
    '  specific bee diseases/pests are possible.',
    '',
    'When diseasePossible is true, consider likelihood across the common threats and give a short',
    'practical note per disease. Reason through clues such as:',
    '- Sharp or sustained weight loss → possible starvation, Nosema, or Varroa collapse.',
    '- Out-of-range temperature/humidity → brood temperature regulation issues, colony stress,',
    '  possible AFB/EFB contamination, or humidity-driven fungal pressure.',
    '- High swarming risk + weight gain → normal swarming prep, usually not disease.',
    '- Elevated disease/pest score → deepen the disease hypotheses.',
    'Be mindful of species: Apis cerana tends to be more resistant to Varroa, Apis mellifera',
    'more susceptible; Italian (ligustica) often hygienic.',
    '',
    'You MUST respond in valid JSON with EXACTLY this shape:',
    '{"diseasePossible": boolean, "possibleDiseases": [{"name": string, "likelihood": "low"|"medium"|"high", "note"?: string}], "recommendedActions": string[], "summary": string}.',
    '"summary" should be a 2-4 sentence beekeeper-friendly explanation ending with the bottom-line',
    'recommendation. If no disease is likely, say so plainly in the summary.',
    '',
    `Bee species kept: ${context.beeSpecies || 'not specified'}.`,
    `Primary floral/nectar source: ${context.nectarSource || 'not specified'}.`,
  ].join('\n');

  const user = [
    `Hive: ${context.hiveName} (${context.hiveId})`,
    `Assessment status: ${context.status}`,
    `Telemetry condition score: ${context.telemetryConditionScore ?? 'n/a'}`,
    `Data quality: ${context.dataQualityLabel}`,
    `Latest reading: temp ${fmt(context.latestReading.temperature)} C, humidity ${fmt(context.latestReading.humidity)} %, weight ${fmt(context.latestReading.weight)} kg, battery ${fmt(context.latestReading.battery)} V`,
    `Indicators: temp=${context.indicators.temperature}, humidity=${context.indicators.humidity}, weight=${context.indicators.weightChange}, battery=${context.indicators.battery}`,
    `Risk scores: ${Object.entries(context.riskScores).map(([k, v]) => `${k}=${v}`).join(', ') || 'n/a'}`,
    `Flags/reasons: ${context.reasons.join('; ') || 'none'}`,
    '',
    'Given this abnormal condition, determine whether any bee disease or pest is possible, then,',
    'if so, which specific diseases/pests and how likely each is, plus what the beekeeper should',
    'do next. Return JSON only.',
  ].join('\n');

  let res: Response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://honeychain.local',
        'X-Title': 'HoneyChain Beekeeper App',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return null;
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return parseLlmJson(content) ?? null;
}

function parseLlmJson(content: string): LlmAnalysis | null {
  try {
    const parsed = JSON.parse(content) as Partial<LlmAnalysis>;
    const possibleDiseases = Array.isArray(parsed.possibleDiseases)
      ? parsed.possibleDiseases
          .filter((d) => d && typeof d.name === 'string')
          .map((d) => ({
            name: d.name,
            likelihood: normalizeLikelihood(d.likelihood),
            note: typeof d.note === 'string' ? d.note : undefined,
          }))
      : [];
    const diseasePossible = typeof parsed.diseasePossible === 'boolean'
      ? parsed.diseasePossible
      : possibleDiseases.length > 0;
    return {
      diseasePossible,
      possibleDiseases,
      recommendedActions: Array.isArray(parsed.recommendedActions)
        ? parsed.recommendedActions.filter((a): a is string => typeof a === 'string')
        : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    };
  } catch {
    return null;
  }
}

function normalizeLikelihood(v: unknown): 'low' | 'medium' | 'high' {
  const s = String(v ?? '').toLowerCase();
  if (s === 'high') return 'high';
  if (s === 'medium' || s === 'moderate') return 'medium';
  return 'low';
}

function fmt(v: number | null | undefined): string {
  return v == null ? 'n/a' : String(v);
}
