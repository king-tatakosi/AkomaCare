import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Check, X, History } from 'lucide-react';
import { recentLogEntriesQuery } from '../lib/referralLog';

const SEVERITY_META = {
  emergency: { dot: 'bg-emergency', label: 'Emergency' },
  urgent: { dot: 'bg-urgent', label: 'Refer' },
  routine: { dot: 'bg-routine', label: 'Dispense' },
};

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * ReferralHistoryScreen
 *
 * On-device only, reactive via useLiveQuery (updates the moment
 * useReferral.generate/markSent writes to Dexie — no manual refetch).
 * No auth, no roles, no cross-device sync: this is the free-tier floor
 * of "prove you actually screened and referred", available to whoever
 * is using the app right now. A cross-device admin view is a separate,
 * later Supabase-backed feature, not a role check bolted onto this one.
 *
 * Deliberately shows no patient-identifying detail — see
 * referralLog.js for why the phone number was excluded at the source.
 */
export function ReferralHistoryScreen({ onBack }) {
  const entries = useLiveQuery(() => recentLogEntriesQuery(), []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to screening"
          className="min-h-11 min-w-11 flex items-center justify-center rounded-lg cursor-pointer touch-manipulation focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
        >
          <ArrowLeft aria-hidden="true" size={22} />
        </button>
        <div>
          <h1 className="text-xl font-bold leading-tight">Referral History</h1>
          <p className="text-sm opacity-90">On this device only — no patient details stored</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-3">
        {entries === undefined && (
          <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
        )}

        {entries?.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-center py-12">
            <History aria-hidden="true" size={28} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground max-w-xs">
              No referrals logged yet. Every screening that ends in a refer or dispense decision
              will show up here.
            </p>
          </div>
        )}

        {entries?.map((entry) => {
          const severity = SEVERITY_META[entry.overallSeverity] ?? SEVERITY_META.routine;
          return (
            <div
              key={entry.id}
              className="bg-card border-2 border-border rounded-xl p-3.5 flex items-start gap-3"
            >
              <span aria-hidden="true" className={`w-3 h-3 rounded-full shrink-0 mt-1 ${severity.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-card-foreground truncate">
                    {severity.label} — {entry.ageGroup === 'pediatric' ? 'Pediatric' : 'Adult'}
                    {entry.pregnant ? ', pregnant' : ''}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatTimestamp(entry.createdAt)}
                  </span>
                </div>
                {entry.symptoms?.length > 0 && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {entry.symptoms.join(', ')}
                  </p>
                )}
                {entry.overallSeverity !== 'routine' && (
                  <p
                    className={[
                      'flex items-center gap-1 text-xs font-bold mt-1',
                      entry.sent ? 'text-routine' : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    {entry.sent ? (
                      <Check aria-hidden="true" size={14} />
                    ) : (
                      <X aria-hidden="true" size={14} />
                    )}
                    {entry.sent ? 'Sent' : 'Not sent'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
