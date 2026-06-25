# ResumeForge India — ATS-Friendly Resume Builder

A production-grade, WYSIWYG resume builder tailored to **Indian recruiter conventions** with
**pixel-accurate preview → download parity**. The shipped app in this repo is a fully working
**React + Vite + Tailwind** single-page application. This README documents the complete
target architecture (Next.js + tRPC + PostgreSQL/Prisma + Redis + S3 + BullMQ + Puppeteer),
the AI integration with `claude-sonnet-4-6`, tests, and CI/CD so the system can be completed
without ambiguity.

---

## 1. Design summary

- **Workflow:** template → fill → preview → customize → download.
- **Parity guarantee:** the PDF/DOCX is generated from the **exact same DOM** that renders the
  preview (`#resume-page`, see `src/components/ResumePreview.tsx`). No divergent template engine.
- **Indian conventions:** reverse-chronological, contact header, summary, categorized key skills,
  experience with metrics, education, certifications, projects, internships; A4 default with US
  Letter override; Indian English; city + state location fields.
- **6 ATS templates:** 4 single-column (strict ATS), 2 two-column (text kept in logical DOM order).

## 2. Component breakdown

| Layer | Shipped (this repo) | Production target |
| --- | --- | --- |
| Frontend | React 19 + Vite + Tailwind | Next.js (App Router) + Tailwind |
| Auth | `src/lib/store.ts` (SHA-256, localStorage) | NextAuth + argon2, OAuth optional |
| State/DB | localStorage | PostgreSQL + Prisma, Redis cache |
| AI | `src/lib/ai.ts` (deterministic stub) | `/api/ai/*` → `claude-sonnet-4-6` |
| PDF | `jsPDF` + `html2canvas` from live node | BullMQ worker + Puppeteer `page.pdf()` |
| DOCX | `docx` package | same, server-side |
| Storage | n/a | S3-compatible (assets, generated files) |

## 3. API specs (tRPC / REST)

```
GET    /api/templates                 → TemplateMeta[]
GET    /api/templates/:id/html        → { html, css, version }
POST   /api/resumes                   → create   { data, themeId } → Resume
PUT    /api/resumes/:id               → update
POST   /api/resumes/:id/preview       → { html }            (SSR of ResumePreview)
POST   /api/resumes/:id/pdf           → { jobId }            (enqueue BullMQ)
GET    /api/jobs/:jobId               → { status, url }
POST   /api/ai/generate               → { type, payload }   → { output[], needsConfirmation }
POST   /api/ai/validate               → { text, resumeId }  → { flags[] }
POST   /api/auth/login | /signup
GET    /api/account/export            → application/json
DELETE /api/account                   → 204
```

**Example — `POST /api/ai/generate`**
```jsonc
// request
{ "type": "quantify", "payload": { "raw_bullet_text": "Improved API performance" } }
// response 200
{ "output": ["Optimised API latency, improving throughput by ~25% (confirm exact figure)."],
  "needsConfirmation": true,
  "clarifyingQuestion": "Replace ~25% with your real metric before saving." }
```
Error codes: `400` validation, `401` unauth, `409` duplicate email, `429` rate limit, `502` LLM upstream.

## 4. Data models (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  passwordHash String
  resumes   Resume[]
  createdAt DateTime @default(now())
}
model Template {
  id        String   @id
  name      String
  columns   Int
  atsScore  Int
  versions  TemplateVersion[]
}
model TemplateVersion {
  id         String   @id @default(cuid())
  templateId String
  template   Template @relation(fields: [templateId], references: [id])
  html       String   // versioned in DB so templates ship without code deploys
  css        String
  version    Int
  createdAt  DateTime @default(now())
}
model Resume {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  data      Json     // PII fields encrypted at rest (see §7)
  theme     Json
  sections  Json
  updatedAt DateTime @updatedAt
}
model AiRequest {
  id        String   @id @default(cuid())
  userId    String
  type      String
  status    String   // queued|done|flagged|error
  tokensIn  Int
  tokensOut Int
  createdAt DateTime @default(now())
}
model DownloadJob {
  id        String   @id @default(cuid())
  resumeId  String
  format    String   // pdf|docx
  status    String
  url       String?
  createdAt DateTime @default(now())
}
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  meta      Json
  createdAt DateTime @default(now())
}
```

## 5. Sample UI / templates

All template layouts live in `src/components/ResumePreview.tsx` + `src/index.css`
(`.rp-*` classes). Two filled examples (Indian fresher + senior SDE with AI-quantified bullets
and ATS keywords) are in `src/data/samples.ts` and are loadable from the gallery.

## 6. AI integration (`claude-sonnet-4-6`)

Prompt templates (exactly as required) and the Indian-context system message are in
`src/lib/ai.ts`. Production call pattern:

```ts
const res = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 512,
  temperature: 0.4,            // 0.2 for keywords, 0.5 for cover letters
  system: SYSTEM_PROMPT_INDIA, // forces Indian recruiter context + no fabrication
  messages: [{ role: "user", content: filledUserTemplate }],
});
```
- **Back-off/retry:** exponential (250ms·2^n, max 5) on `429/5xx`; circuit-break after repeated 5xx.
- **Rate limits/cost:** Redis token-bucket per user (e.g. 20 req/min, 300/day); cache identical
  prompts (hash → answer, TTL 24h); cap `max_tokens`; prefer `temperature 0.2–0.5`.
- **Safety/validation:** every output passes `validateAiOutput()` (`src/lib/validation.ts`):
  future-date rejection, employer/degree fabrication flags, estimated-metric confirmation gate.
  Outputs with `needsConfirmation` **cannot autosave** — the user must edit/approve.

## 7. Privacy, security & encryption

- PII (`email`, `phone`, address) encrypted **AES-256-GCM**; keys in KMS, **90-day rotation**.
  Prisma field-level example using a `@encrypted` middleware that wraps `cipher.update/final`.
- DPDP/GDPR: data export (`GET /api/account/export`) and erasure (`DELETE /api/account`) — both
  demonstrated in-app via `src/components/AccountModal.tsx`.
- OWASP: argon2 password hashing, CSRF tokens, helmet headers, input validation (zod), rate
  limiting on AI + auth, parameterized queries via Prisma.

## 8. Download-parity test (Playwright)

```ts
// tests/parity.spec.ts
import { test, expect } from '@playwright/test';

test('preview matches downloaded PDF render', async ({ page }) => {
  await page.goto('/builder?sample=senior');
  const preview = page.locator('#resume-page');
  const previewShot = await preview.screenshot();
  // Trigger server PDF (Puppeteer prints the SAME #resume-page HTML)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Download PDF/ }).click(),
  ]);
  const pdfPath = await download.path();
  const pdfPng = await renderPdfFirstPage(pdfPath); // pdf-to-png util
  expect(pdfPng).toMatchSnapshot('senior-golden.png', { maxDiffPixelRatio: 0.02 });
  expect(previewShot).toMatchSnapshot('senior-preview.png', { maxDiffPixelRatio: 0.02 });
});
```
Server PDF embeds fonts via `@font-face` (open fonts: **Inter**, fallback Georgia/Times) and prints
with `page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })` honoring the
`@media print` rules in `src/index.css` (page-break-inside: avoid, zero margins).

## 9. Deployment & CI/CD

- **Local:** `npm install && npm run dev`. Build: `npm run build` (outputs single-file `dist/index.html`).
- **Docker (target):** `docker-compose up` runs web, postgres, redis, minio, pdf-worker.
- **GitHub Actions:** lint → typecheck → `jest` unit → `playwright` (incl. parity) → `snyk test`
  → build & push Docker image → deploy (Vercel frontend / containerized backend on AWS/GCP).
- **Terraform (minimal):** RDS Postgres, S3 bucket, ACM TLS cert, Route53 record.

## 10. Acceptance / demo steps

1. Sign up → from gallery click **“Load Senior SDE sample”**.
2. Preview shows the exact layout; open **AI Assistant → Quantify bullet**, enter a responsibility —
   note the **confirmation gate** (estimated metrics flagged, nothing auto-saved).
3. Open **ATS Checker**, paste a JD → see score + missing keywords.
4. Click **Test parity** (✓ Parity OK), then **Download PDF** → file
   `rahul_verma_resume-techcompact.pdf` matches the preview.
5. **Account & Privacy** → Export data / Delete account (DPDP/GDPR flows).

> Fonts: ships with open fonts only (Inter / system serif). Licensed fonts are optional — add a
> self-hosted `@font-face` and reference it in `src/index.css`; the PDF will embed it automatically.
```
```

## Security checklist
- [ ] argon2 hashing, OAuth optional
- [ ] zod validation on every endpoint
- [ ] Redis rate-limit on `/api/ai/*` and auth
- [ ] AES-256-GCM field encryption + KMS rotation
- [ ] DPDP/GDPR export + erasure
- [ ] Snyk/Dependabot in CI
- [ ] CSP + helmet headers, HTTPS-only cookies
