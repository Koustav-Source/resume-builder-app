// ---------------------------------------------------------------------------
// Client persistence. In production this is replaced by the tRPC/REST backend
// (PostgreSQL + Prisma) with field-level encryption for PII (see README).
// Here we use localStorage so the full multi-project + auth UX works offline.
//
// SECURITY NOTE: passwords are NOT stored in plaintext even in the demo — we
// store a SHA-256 hash. Real auth must use bcrypt/argon2 on the server.
// ---------------------------------------------------------------------------

import type { ResumeProject, User } from '../types';

const USERS_KEY = 'rf_users';
const SESSION_KEY = 'rf_session';
const projKey = (email: string) => `rf_projects_${email}`;

interface StoredUser { email: string; name: string; hash: string }

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); } catch { return []; }
}
function writeUsers(u: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

export const store = {
  async signup(name: string, email: string, password: string): Promise<User> {
    const users = readUsers();
    if (users.find((u) => u.email === email)) throw new Error('An account with this email already exists.');
    const hash = await sha256(password);
    users.push({ email, name, hash });
    writeUsers(users);
    localStorage.setItem(SESSION_KEY, email);
    return { email, name };
  },

  async login(email: string, password: string): Promise<User> {
    const users = readUsers();
    const u = users.find((x) => x.email === email);
    if (!u || u.hash !== (await sha256(password))) throw new Error('Invalid email or password.');
    localStorage.setItem(SESSION_KEY, email);
    return { email: u.email, name: u.name };
  },

  logout() { localStorage.removeItem(SESSION_KEY); },

  current(): User | null {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    const u = readUsers().find((x) => x.email === email);
    return u ? { email: u.email, name: u.name } : null;
  },

  getProjects(email: string): ResumeProject[] {
    try { return JSON.parse(localStorage.getItem(projKey(email)) ?? '[]'); } catch { return []; }
  },
  saveProjects(email: string, projects: ResumeProject[]) {
    localStorage.setItem(projKey(email), JSON.stringify(projects));
  },

  // GDPR/DPDP-style data portability + erasure.
  exportData(email: string): string {
    return JSON.stringify({ user: this.current(), projects: this.getProjects(email) }, null, 2);
  },
  deleteAccount(email: string) {
    localStorage.removeItem(projKey(email));
    writeUsers(readUsers().filter((u) => u.email !== email));
    this.logout();
  },
};
