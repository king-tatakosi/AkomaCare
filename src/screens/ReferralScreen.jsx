import { useState } from 'react';
import { ArrowLeft, Copy, MessageSquare, Check } from 'lucide-react';
import { RedFlagBanner } from '../components/RedFlagBanner';
import { PrescribingGuidanceCard } from '../components/PrescribingGuidanceCard';
import { buildReferralNoteText, buildSmsLink } from '../lib/referral';

/**
 * ReferralScreen — simplified per product decision.
 *
 * Everything that used to live here (referral code, QR, WhatsApp,
 * draft->sent->confirmed tracking, the screened-data recap card) was
 * removed in favor of the smallest thing that actually does the job:
 * type the patient's number, review the note, tap Send SMS.
 *
 * The number lives only in this component's own state — it's used to
 * build the `sms:` href and nothing else. It's never added to the
 * `referral` object, so it never reaches Dexie or Supabase; the
 * "no phone number stored" principle still holds even though a number
 * is now typed in.
 */
export function ReferralScreen({ referral, onMarkSent, onBack }) {
  const [phone, setPhone] = useState('');
  const noteText = buildReferralNoteText(referral);
  const smsLink = phone.trim() ? buildSmsLink(phone.trim(), noteText) : undefined;

  const handleCopyNote = () => {
    navigator.clipboard?.writeText(noteText);
  };

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
        <h1 className="text-xl font-bold leading-tight">Referral</h1>
      </header>

      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-6">
        <RedFlagBanner
          result={{ flags: referral.flags, overallSeverity: referral.overallSeverity }}
        />
        <PrescribingGuidanceCard guidance={referral.prescribingGuidance} />

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Referral Note
            </h2>
            <button
              type="button"
              onClick={handleCopyNote}
              aria-label="Copy referral note"
              className="min-h-9 min-w-9 flex items-center justify-center rounded-lg cursor-pointer text-muted-foreground hover:text-primary transition-colors duration-150 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
            >
              <Copy aria-hidden="true" size={18} />
            </button>
          </div>
          <pre className="bg-card border-2 border-border rounded-xl p-4 text-sm whitespace-pre-wrap font-sans text-card-foreground">
            {noteText}
          </pre>
        </section>

        <section className="flex flex-col gap-2">
          <label htmlFor="patient-phone" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Patient's phone number
          </label>
          <input
            id="patient-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="e.g. 024 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={[
              'min-h-12 rounded-xl border-2 border-border bg-card px-3.5 text-base text-card-foreground',
              'placeholder:text-muted-foreground',
              'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
            ].join(' ')}
          />
          <p className="text-xs text-muted-foreground">
            Only used to open your messaging app with the note filled in — not saved anywhere.
          </p>
        </section>

        <a
          href={smsLink}
          aria-disabled={!smsLink}
          onClick={(e) => {
            if (!smsLink) {
              e.preventDefault();
              return;
            }
            onMarkSent();
          }}
          className={[
            'min-h-14 rounded-xl text-lg font-bold cursor-pointer touch-manipulation transition-colors duration-150',
            'flex items-center justify-center gap-2',
            'bg-accent text-accent-foreground',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
            !smsLink && 'opacity-40 pointer-events-none',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <MessageSquare aria-hidden="true" size={20} />
          Send SMS
        </a>

        {referral.sent && (
          <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-routine">
            <Check aria-hidden="true" size={16} />
            Marked as sent
          </p>
        )}
      </main>
    </div>
  );
}
