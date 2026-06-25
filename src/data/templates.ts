import type { TemplateMeta } from '../types';

// Six distinct ATS-friendly templates aligned to Indian recruiter expectations.
// Single-column variants keep a strict logical DOM order for ATS parsers; the
// two-column variants still place the text content in reading order in the DOM.
export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'classic-blue',
    name: 'Classic Professional',
    tagline: 'Reverse-chronological single column. The safest ATS choice.',
    columns: 1,
    atsScore: 98,
    palette: ['#1d4ed8', '#0f766e', '#7c3aed', '#b91c1c', '#0f172a'],
  },
  {
    id: 'modern-sidebar',
    name: 'Modern Sidebar',
    tagline: 'Two-column with accent sidebar. Great for skills-heavy roles.',
    columns: 2,
    atsScore: 90,
    palette: ['#0f766e', '#1d4ed8', '#9333ea', '#c2410c', '#0f172a'],
  },
  {
    id: 'minimal-serif',
    name: 'Minimal Serif',
    tagline: 'Elegant serif typography for senior & leadership profiles.',
    columns: 1,
    atsScore: 95,
    palette: ['#0f172a', '#7c2d12', '#1e3a8a', '#365314', '#581c87'],
  },
  {
    id: 'tech-compact',
    name: 'Tech Compact',
    tagline: 'Dense single column built for SDE & data roles.',
    columns: 1,
    atsScore: 96,
    palette: ['#2563eb', '#059669', '#db2777', '#ea580c', '#475569'],
  },
  {
    id: 'fresher-focus',
    name: 'Fresher Focus',
    tagline: 'Highlights education, projects & internships for new grads.',
    columns: 1,
    atsScore: 94,
    palette: ['#7c3aed', '#0891b2', '#16a34a', '#dc2626', '#1e293b'],
  },
  {
    id: 'executive-two',
    name: 'Executive Two-Tone',
    tagline: 'Polished header band for managers & architects.',
    columns: 2,
    atsScore: 88,
    palette: ['#155e75', '#1e40af', '#831843', '#3f6212', '#1f2937'],
  },
];

export const getTemplate = (id: string): TemplateMeta =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
