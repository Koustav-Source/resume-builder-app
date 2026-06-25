// ---------------------------------------------------------------------------
// AI assistance layer.
//
// In production these prompt templates are sent to claude-sonnet-4-6 via the
// backend `/api/ai/generate` route (see README "AI integration"). The backend
// adds the Indian-context system message, applies rate limiting (Redis token
// bucket), retries with exponential back-off, and caches identical prompts.
//
// In this browser-only demo we run a deterministic local generator so the UX
// (and the validation pipeline) is fully exercisable without API keys.
// ---------------------------------------------------------------------------

import type { ExperienceLevel } from '../types';

export const SYSTEM_PROMPT_INDIA = `You are an expert resume writer for Indian tech recruiters.
Prioritize Indian company recruiter expectations (Bengaluru, Hyderabad, Mumbai tech/hiring norms),
use Indian English, and prefer A4 formatting. NEVER fabricate employers, dates, degrees, or metrics.
When required data is missing, ask exactly one concise clarifying question instead of inventing facts.`;

// The exact prompt templates required by the spec (editable by the user in UI).
export const PROMPT_TEMPLATES = {
  summary: {
    label: 'Generate professional summary',
    system: SYSTEM_PROMPT_INDIA,
    user: 'Generate a concise (1–2 lines) professional summary for a {experience}-year {role} in {domain}, using Indian English, avoiding exaggeration. Data: {name, top_skills, most_recent_role, industry}. If any data missing, ask one follow-up question.',
  },
  quantify: {
    label: 'Quantify responsibility into achievement bullets',
    system: 'You are an achievement quantifier.',
    user: 'Convert this responsibility into 2–3 quantified achievement bullets showing impact and metrics where possible: {raw_bullet_text}. If metrics are not provided, propose sensible ranges and ask user to confirm before saving.',
  },
  keywords: {
    label: 'Suggest ATS keywords from a JD',
    system: 'You are an ATS optimization assistant for Indian job posts.',
    user: 'From this JD, extract 10 prioritized keywords and map them to resume sections where they should appear: {job_description_text}.',
  },
  coverLetter: {
    label: 'Draft a short cover letter',
    system: SYSTEM_PROMPT_INDIA,
    user: 'Draft a short (120–160 word) cover letter for the role {role} at {company} based on this resume summary: {summary}. Indian English, no fabricated facts.',
  },
} as const;

export interface AiResult {
  output: string[];
  needsConfirmation: boolean; // true when the model proposed estimated metrics
  clarifyingQuestion?: string;
}

const STRONG_VERBS = ['Led', 'Built', 'Optimised', 'Reduced', 'Improved', 'Automated', 'Delivered', 'Scaled'];

// ---- Local deterministic generators (stand-ins for Sonnet) ----------------
export function generateSummary(args: {
  level: ExperienceLevel;
  role: string;
  domain: string;
  topSkills: string;
}): AiResult {
  if (!args.role.trim() || !args.topSkills.trim()) {
    return {
      output: [],
      needsConfirmation: false,
      clarifyingQuestion:
        'What is your target role and your top 3 skills? I need these to write an accurate summary.',
    };
  }
  const lvlText =
    args.level === 'fresher'
      ? 'aspiring'
      : args.level === 'senior'
        ? 'Senior'
        : 'Mid-level';
  const domain = args.domain.trim() || 'software';
  const skills = args.topSkills.split(',').slice(0, 3).map((s) => s.trim()).filter(Boolean).join(', ');
  return {
    output: [
      `${lvlText} ${args.role} with strong expertise in ${skills}, focused on building reliable, scalable ${domain} solutions. Known for delivering measurable impact and collaborating effectively in fast-paced Indian product teams.`,
    ],
    needsConfirmation: false,
  };
}

export function quantifyBullet(raw: string): AiResult {
  const text = raw.trim();
  if (!text) {
    return { output: [], needsConfirmation: false, clarifyingQuestion: 'Please enter the responsibility you want to quantify.' };
  }
  const verb = STRONG_VERBS[text.length % STRONG_VERBS.length];
  // We propose estimated metrics and FLAG for confirmation (never auto-save).
  return {
    needsConfirmation: true,
    clarifyingQuestion:
      'I added estimated metrics (shown as ~X%). Please replace them with your real numbers before saving — I will not fabricate figures.',
    output: [
      `${verb} ${lowerFirst(text)}, improving efficiency by ~20–30% (confirm exact figure).`,
      `${verb} initiative around "${truncate(text, 40)}" that reduced effort/cost by ~15% (confirm metric).`,
      `Delivered ${lowerFirst(text)} on schedule, impacting ~1,000+ users (confirm scope).`,
    ],
  };
}

export function suggestKeywords(jd: string): AiResult {
  const text = jd.toLowerCase();
  const dictionary = [
    'java', 'python', 'react', 'node', 'spring boot', 'microservices', 'kubernetes', 'docker',
    'aws', 'kafka', 'redis', 'postgresql', 'system design', 'rest api', 'ci/cd', 'agile',
    'data structures', 'sql', 'typescript', 'graphql', 'machine learning', 'tdd', 'go', 'terraform',
  ];
  const found = dictionary.filter((k) => text.includes(k));
  const base = found.length ? found : dictionary.slice(0, 10);
  const mapping: Record<string, string> = {
    java: 'Skills', python: 'Skills', react: 'Skills', node: 'Skills', 'spring boot': 'Experience',
    microservices: 'Experience', kubernetes: 'Skills', docker: 'Skills', aws: 'Skills',
    'system design': 'Summary', 'rest api': 'Experience', 'ci/cd': 'Skills', agile: 'Summary',
  };
  const out = base.slice(0, 10).map((k, i) => `${i + 1}. ${k} → ${mapping[k] ?? 'Skills'}`);
  return { output: out, needsConfirmation: false };
}

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}
