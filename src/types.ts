// ---------------------------------------------------------------------------
// Domain types for the resume builder. These mirror the Prisma data models
// documented in README.md (Resume, Template, AiRequest, etc.) so the client
// shape matches the eventual server contract 1:1.
// ---------------------------------------------------------------------------

export type ExperienceLevel = 'fresher' | 'mid' | 'senior';

export type PaperSize = 'A4' | 'Letter';

export interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string; // e.g. "Bengaluru, Karnataka"
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface SkillGroup {
  id: string;
  category: string; // e.g. "Languages", "Frameworks", "Tools"
  items: string; // comma separated
}

export interface ExperienceItem {
  id: string;
  company: string;
  city: string; // Indian city + state
  role: string;
  start: string; // "Jun 2021"
  end: string; // "Present"
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institute: string;
  city: string;
  year: string;
  score: string; // CGPA / %
}

export interface ProjectItem {
  id: string;
  name: string;
  tech: string;
  link: string;
  bullets: string[];
}

export interface CertItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface SimpleItem {
  id: string;
  title: string;
  detail: string;
}

export interface ResumeData {
  contact: Contact;
  summary: string;
  skills: SkillGroup[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertItem[];
  internships: SimpleItem[];
  achievements: SimpleItem[];
  level: ExperienceLevel;
}

export type SectionKey =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'internships'
  | 'achievements';

export interface SectionConfig {
  key: SectionKey;
  label: string;
  enabled: boolean;
}

export interface ThemeConfig {
  templateId: string;
  accent: string; // hex within template palette
  fontScale: 'compact' | 'normal' | 'roomy';
  fontFamily: 'sans' | 'serif';
  paper: PaperSize;
}

export interface TemplateMeta {
  id: string;
  name: string;
  tagline: string;
  columns: 1 | 2;
  atsScore: number; // out of 100 baseline structure score
  palette: string[]; // allowed accent colors
}

export interface ResumeProject {
  id: string;
  title: string;
  updatedAt: number;
  data: ResumeData;
  theme: ThemeConfig;
  sections: SectionConfig[];
}

export interface User {
  email: string;
  name: string;
}
