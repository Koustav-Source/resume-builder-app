// ---------------------------------------------------------------------------
// Rules engine for AI output safety + ATS compliance checking.
// Mirrors the server-side `/api/ai/validate` route described in README.
// ---------------------------------------------------------------------------

import type { ResumeData, SectionConfig } from '../types';

export interface ValidationFlag {
  level: 'error' | 'warn' | 'info';
  message: string;
}

// ---- AI output validation (no fabricated facts) ---------------------------
export function validateAiOutput(text: string, resume: ResumeData): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  const lower = text.toLowerCase();

  // Date sanity: catch obviously invalid year ranges like 2030, or end < start.
  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0]));
  const now = new Date().getFullYear();
  if (years.some((y) => y > now + 1)) {
    flags.push({ level: 'error', message: `Output references a future year (> ${now + 1}). Remove fabricated dates.` });
  }

  // Employer fabrication: any "at <Company>" not present in the resume.
  const knownCompanies = resume.experience.map((e) => e.company.toLowerCase()).filter(Boolean);
  const atMatch = [...text.matchAll(/\bat ([A-Z][A-Za-z0-9&.\- ]{2,30})/g)];
  for (const m of atMatch) {
    const claimed = m[1].trim().toLowerCase();
    if (knownCompanies.length && !knownCompanies.some((c) => claimed.includes(c) || c.includes(claimed))) {
      flags.push({ level: 'warn', message: `Mentions employer "${m[1].trim()}" not in your experience. Confirm before saving.` });
    }
  }

  // Estimated-metric guard.
  if (/~\d|approximately|confirm (exact|metric|scope|figure)/.test(lower)) {
    flags.push({ level: 'info', message: 'Contains estimated metrics — replace with your real numbers before saving.' });
  }

  // Degree fabrication hint.
  if (/(phd|m\.?tech|b\.?tech|mba)/.test(lower) && resume.education.every((e) => !e.degree)) {
    flags.push({ level: 'warn', message: 'References a degree but your Education section is empty. Verify accuracy.' });
  }

  return flags;
}

// ---- ATS compliance checker -----------------------------------------------
export interface AtsReport {
  score: number;
  passed: ValidationFlag[];
  issues: ValidationFlag[];
  missingKeywords: string[];
}

export function runAtsCheck(
  resume: ResumeData,
  sections: SectionConfig[],
  jobDescription: string,
): AtsReport {
  const issues: ValidationFlag[] = [];
  const passed: ValidationFlag[] = [];
  let score = 100;

  const c = resume.contact;
  const has = (v: string) => v.trim().length > 0;

  // Contact completeness.
  if (!has(c.name) || !has(c.email) || !has(c.phone)) {
    issues.push({ level: 'error', message: 'Contact header missing name, email or phone.' });
    score -= 12;
  } else passed.push({ level: 'info', message: 'Contact header complete (name, email, phone).' });

  // Email format.
  if (has(c.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
    issues.push({ level: 'warn', message: 'Email format looks invalid.' });
    score -= 4;
  }

  // Summary.
  if (!has(resume.summary)) {
    issues.push({ level: 'warn', message: 'No professional summary — recruiters scan this first.' });
    score -= 8;
  } else if (resume.summary.split(/\s+/).length > 60) {
    issues.push({ level: 'warn', message: 'Summary is long (>60 words). Keep it to 2–3 lines.' });
    score -= 3;
  } else passed.push({ level: 'info', message: 'Concise professional summary present.' });

  // Skills.
  const skillCount = resume.skills.reduce((n, g) => n + g.items.split(',').filter((s) => s.trim()).length, 0);
  if (skillCount < 6) {
    issues.push({ level: 'warn', message: `Only ${skillCount} skills listed. Aim for 8–15 relevant skills.` });
    score -= 6;
  } else passed.push({ level: 'info', message: `${skillCount} skills listed across categories.` });

  // Experience metrics — quantification is what Indian recruiters look for.
  const allBullets = [
    ...resume.experience.flatMap((e) => e.bullets),
    ...resume.projects.flatMap((p) => p.bullets),
  ].filter((b) => b.trim());
  const quantified = allBullets.filter((b) => /\d/.test(b)).length;
  if (allBullets.length > 0 && quantified / allBullets.length < 0.4) {
    issues.push({ level: 'warn', message: 'Fewer than 40% of bullets have metrics. Quantify achievements (%, ₹, users, time).' });
    score -= 8;
  } else if (allBullets.length) {
    passed.push({ level: 'info', message: `${quantified}/${allBullets.length} bullets are quantified.` });
  }

  // Education.
  if (resume.education.every((e) => !has(e.degree))) {
    issues.push({ level: 'error', message: 'Education section is empty — required for Indian resumes.' });
    score -= 10;
  } else passed.push({ level: 'info', message: 'Education section present.' });

  // Section ordering / enablement.
  if (!sections.find((s) => s.key === 'experience')?.enabled && resume.level !== 'fresher') {
    issues.push({ level: 'warn', message: 'Experience section disabled for a non-fresher profile.' });
    score -= 5;
  }

  // Formatting hygiene that ATS parsers care about.
  const longBullet = allBullets.find((b) => b.split(/\s+/).length > 35);
  if (longBullet) {
    issues.push({ level: 'warn', message: 'Some bullets exceed ~35 words. Split for ATS readability.' });
    score -= 3;
  }

  // Keyword matching vs JD.
  let missingKeywords: string[] = [];
  if (jobDescription.trim()) {
    const resumeText = JSON.stringify(resume).toLowerCase();
    const jdWords = extractKeywords(jobDescription);
    missingKeywords = jdWords.filter((w) => !resumeText.includes(w.toLowerCase()));
    if (missingKeywords.length) {
      issues.push({ level: 'warn', message: `${missingKeywords.length} JD keyword(s) missing from your resume.` });
      score -= Math.min(15, missingKeywords.length * 2);
    } else {
      passed.push({ level: 'info', message: 'All detected JD keywords present.' });
    }
  }

  return { score: Math.max(0, Math.round(score)), passed, issues, missingKeywords };
}

function extractKeywords(jd: string): string[] {
  const stop = new Set([
    'the', 'and', 'for', 'with', 'you', 'will', 'are', 'our', 'have', 'job', 'role', 'work',
    'team', 'experience', 'years', 'should', 'must', 'this', 'that', 'from', 'your', 'who',
    'a', 'an', 'to', 'of', 'in', 'on', 'as', 'is', 'be', 'or', 'we', 'at', 'by',
  ]);
  const counts = new Map<string, number>();
  for (const raw of jd.toLowerCase().match(/[a-z+#.]{3,}/g) ?? []) {
    if (stop.has(raw)) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}
