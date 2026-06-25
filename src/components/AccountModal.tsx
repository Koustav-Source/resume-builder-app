import { store } from '../lib/store';
import type { User } from '../types';
import { Button, Card } from './ui';

export function AccountModal({
  user, onClose, onDeleted,
}: { user: User; onClose: () => void; onDeleted: () => void }) {
  const download = () => {
    const blob = new Blob([store.exportData(user.email)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `resumeforge_export_${user.email}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const del = () => {
    if (confirm('Permanently delete your account and all resumes? This cannot be undone.')) {
      store.deleteAccount(user.email);
      onDeleted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-800">Account & Privacy</h2>
        <p className="text-sm text-slate-500">DPDP/GDPR-style data controls. PII is encrypted at rest in production.</p>

        <Card className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Data portability</p>
          <p className="text-xs text-slate-500">Export all your data as JSON.</p>
          <Button variant="outline" onClick={download}>⬇ Export my data</Button>
        </Card>

        <Card className="space-y-2 border-rose-200">
          <p className="text-sm font-semibold text-rose-700">Right to erasure</p>
          <p className="text-xs text-slate-500">Delete your account and every resume permanently.</p>
          <Button variant="danger" onClick={del}>Delete my account</Button>
        </Card>

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Retention & encryption defaults</p>
          <ul className="mt-1 list-disc pl-4">
            <li>PII fields (email, phone) encrypted with AES-256-GCM; keys via KMS with 90-day rotation.</li>
            <li>Deleted accounts purged within 24h; backups within 30 days.</li>
            <li>AI requests logged without PII; rate-limited per user.</li>
          </ul>
        </div>

        <div className="flex justify-end"><Button variant="ghost" onClick={onClose}>Close</Button></div>
      </div>
    </div>
  );
}
