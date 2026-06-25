import { useState, useEffect, useCallback } from 'react';
import type { ResumeProject, User } from './types';
import { store } from './lib/store';
import { Auth } from './components/Auth';
import { Gallery } from './components/Gallery';
import { Builder } from './components/Builder';
import { AccountModal } from './components/AccountModal';

export default function App() {
  const [user, setUser] = useState<User | null>(() => store.current());
  const [projects, setProjects] = useState<ResumeProject[]>([]);
  const [active, setActive] = useState<ResumeProject | null>(null);
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    if (user) setProjects(store.getProjects(user.email));
  }, [user]);

  const persist = useCallback((next: ResumeProject[]) => {
    if (!user) return;
    setProjects(next);
    store.saveProjects(user.email, next);
  }, [user]);

  if (!user) return <Auth onAuth={setUser} />;

  if (active) {
    return (
      <Builder
        project={active}
        onBack={() => setActive(null)}
        onSave={(p) => {
          const next = projects.some((x) => x.id === p.id)
            ? projects.map((x) => (x.id === p.id ? p : x))
            : [p, ...projects];
          persist(next);
          setActive(p);
        }}
      />
    );
  }

  return (
    <>
      <Gallery
        user={user}
        projects={projects}
        onOpen={setActive}
        onCreate={(p) => { persist([p, ...projects]); setActive(p); }}
        onDelete={(id) => persist(projects.filter((x) => x.id !== id))}
        onLogout={() => { store.logout(); setUser(null); }}
        onAccount={() => setShowAccount(true)}
      />
      {showAccount && (
        <AccountModal
          user={user}
          onClose={() => setShowAccount(false)}
          onDeleted={() => { setShowAccount(false); setUser(null); }}
        />
      )}
    </>
  );
}
