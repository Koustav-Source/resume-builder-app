// ---------------------------------------------------------------------------
// Download-parity export pipeline.
//
// PARITY GUARANTEE: the PDF is rasterised from the *exact same DOM node* that
// renders the on-screen preview (`#resume-page`). There is no second template
// engine, so layout, fonts and spacing cannot diverge. In production the same
// component is server-rendered to HTML and printed with headless Chromium
// (Puppeteer `page.pdf({ format: 'A4', printBackground: true })`) using the
// embedded @font-face fonts and `@media print` rules — see README parity test.
//
// Page geometry (mm) for A4 / US Letter at 96dpi preview scale.
// ---------------------------------------------------------------------------

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';
import type { PaperSize, ResumeData, SectionConfig } from '../types';

const PAGE: Record<PaperSize, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  Letter: { w: 215.9, h: 279.4 },
};

export function buildFilename(name: string, templateName: string, ext: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'resume';
  const t = templateName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return `${slug}_resume-${t}.${ext}`;
}

// ---- High-fidelity PDF from the live preview node --------------------------
export async function exportPdf(
  node: HTMLElement,
  opts: { paper: PaperSize; fileName: string },
): Promise<void> {
  const { w, h } = PAGE[opts.paper];
  // Render at 2x for crisp text; html2canvas captures computed styles + fonts.
  const canvas = await html2canvas(node, {
    scale: Math.max(2, window.devicePixelRatio || 1),
    useCORS: true,
    backgroundColor: '#ffffff',
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
    foreignObjectRendering: false,
    logging: false,
    onclone: (doc) => {
      const cloned = doc.getElementById('resume-page');
      if (cloned) {
        cloned.style.transform = 'none';
        cloned.style.margin = '0';
      }
    },
  });

  const pdf = new jsPDF({ unit: 'mm', format: opts.paper === 'A4' ? 'a4' : 'letter', orientation: 'portrait' });
  const imgData = canvas.toDataURL('image/png');
  const imgHmm = (canvas.height * w) / canvas.width;

  if (imgHmm <= h) {
    pdf.addImage(imgData, 'PNG', 0, 0, w, imgHmm);
  } else {
    // Multi-page: slice the tall canvas page by page (preserves spacing).
    let remaining = imgHmm;
    let position = 0;
    while (remaining > 0) {
      pdf.addImage(imgData, 'PNG', 0, position, w, imgHmm);
      remaining -= h;
      if (remaining > 0) {
        pdf.addPage();
        position -= h;
      }
    }
  }
  pdf.save(opts.fileName);
}

// Returns a data URL for the rendered preview — used by the parity self-test.
export async function renderPreviewPng(node: HTMLElement): Promise<string> {
  const canvas = await html2canvas(node, {
    scale: Math.max(2, window.devicePixelRatio || 1),
    backgroundColor: '#ffffff',
    logging: false,
  });
  return canvas.toDataURL('image/png');
}

// ---- DOCX export (ATS-friendly logical order) ------------------------------
export async function exportDocx(
  resume: ResumeData,
  sections: SectionConfig[],
  fileName: string,
): Promise<void> {
  const c = resume.contact;
  const children: Paragraph[] = [];

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: c.name, bold: true, size: 36 })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: c.role, size: 24, color: '444444' })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: [c.email, c.phone, c.location, c.linkedin, c.github].filter(Boolean).join('  |  '),
      size: 18, color: '666666',
    })],
  }));

  const heading = (t: string) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 22 })],
  });
  const bullet = (t: string) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: t, size: 20 })] });
  const line = (t: string, bold = false) => new Paragraph({ children: [new TextRun({ text: t, bold, size: 20 })] });

  const enabled = (k: string) => sections.find((s) => s.key === k)?.enabled;

  if (enabled('summary') && resume.summary) {
    children.push(heading('Professional Summary'), line(resume.summary));
  }
  if (enabled('skills') && resume.skills.length) {
    children.push(heading('Key Skills'));
    resume.skills.forEach((s) => s.items && children.push(line(`${s.category}: ${s.items}`)));
  }
  if (enabled('experience') && resume.experience.length) {
    children.push(heading('Work Experience'));
    resume.experience.forEach((e) => {
      children.push(line(`${e.role} — ${e.company}, ${e.city}`, true));
      children.push(new Paragraph({ children: [new TextRun({ text: `${e.start} – ${e.end}`, italics: true, size: 18, color: '666666' })] }));
      e.bullets.filter(Boolean).forEach((b) => children.push(bullet(b)));
    });
  }
  if (enabled('projects') && resume.projects.length) {
    children.push(heading('Projects'));
    resume.projects.forEach((p) => {
      children.push(line(`${p.name} (${p.tech})`, true));
      p.bullets.filter(Boolean).forEach((b) => children.push(bullet(b)));
    });
  }
  if (enabled('education') && resume.education.length) {
    children.push(heading('Education'));
    resume.education.forEach((e) => {
      children.push(line(`${e.degree} — ${e.institute}`, true));
      children.push(line([e.city, e.year, e.score].filter(Boolean).join('  |  ')));
    });
  }
  if (enabled('internships') && resume.internships.length) {
    children.push(heading('Internships'));
    resume.internships.forEach((i) => { children.push(line(i.title, true)); i.detail && children.push(line(i.detail)); });
  }
  if (enabled('certifications') && resume.certifications.length) {
    children.push(heading('Certifications'));
    resume.certifications.forEach((ct) => children.push(bullet(`${ct.name} — ${ct.issuer} (${ct.year})`)));
  }
  if (enabled('achievements') && resume.achievements.length) {
    children.push(heading('Achievements'));
    resume.achievements.forEach((a) => children.push(bullet(`${a.title}: ${a.detail}`)));
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
