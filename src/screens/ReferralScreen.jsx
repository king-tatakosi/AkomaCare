import { ArrowLeft, Copy, MessageSquare, MessageCircle } from 'lucide-react';
import { RedFlagBanner } from '../components/RedFlagBanner';
import { ReferralCodeDisplay } from '../components/ReferralCodeDisplay';
import { ReferralStatusTimeline } from '../components/ReferralStatusTimeline';
import { ReferralSummaryCard } from '../components/ReferralSummaryCard';
import { PrescribingGuidanceCard } from '../components/PrescribingGuidanceCard';
import {
  REFERRAL_STATUS,
  buildReferralNoteText,
  buildSmsLink,
  buildWhatsAppLink,
} from '../lib/referral';

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * ReferralScreen — shown right after "Generate Referral" is tapped.
 *
 * The plain-text note is the PRIMARY artifact (readable by OPD staff
 * with zero dependency on visiting a URL); the QR/code display is a
 * supplementary audit trail. Demo-only status controls (advanceStatus)
 * stand in for what will become Supabase Realtime pushing status
 * changes once the online sync layer exists — for now, "Confirm
 * Arrival" is something the patient or hospital can tap directly on
 * this same page/link, no telco integration required.
 */
export function ReferralScreen({ referral, onAdvanceStatus, onBack }) {
  const isConfirmed = referral.status === REFERRAL_STATUS.CONFIRMED_RECEIVED;
  const noteText = buildReferralNoteText(referral);
  const smsLink = buildSmsLink(noteText, isIOSDevice());
  const whatsAppLink = buildWhatsAppLink(noteText);

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
        <div>
          <h1 className="text-xl font-bold leading-tight">Referral</h1>
          <p className="text-sm opacity-90">Code #{referral.code}</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-6">
        <RedFlagBanner
          result={{ flags: referral.flags, overallSeverity: referral.overallSeverity }}
        />
        <PrescribingGuidanceCard guidance={referral.prescribingGuidance} />

        <section className="bg-card border-2 border-border rounded-xl p-4">
          <ReferralStatusTimeline status={referral.status} />
        </section>

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

          {/* Primary delivery path: hand the note to the pharmacist's own
              messaging app, recipient picked there — no gateway/API, no
              phone number ever touches this app's state. */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={smsLink}
              className={[
                'min-h-12 rounded-xl font-bold cursor-pointer touch-manipulation',
                'flex items-center justify-center gap-2',
                'bg-accent text-accent-foreground transition-colors duration-150',
                'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
              ].join(' ')}
            >
              <MessageSquare aria-hidden="true" size={18} />
              Send via SMS
            </a>
            <a
              href={whatsAppLink}
              className={[
                'min-h-12 rounded-xl font-bold cursor-pointer touch-manipulation',
                'flex items-center justify-center gap-2',
                'bg-secondary text-secondary-foreground transition-colors duration-150',
                'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
              ].join(' ')}
            >
              <MessageCircle aria-hidden="true" size={18} />
              Send via WhatsApp
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Opens your own messaging app with this note filled in — pick the patient's number
            there, same as sending any other text. Nothing here is saved by this app.
          </p>
        </section>

        <ReferralCodeDisplay code={referral.code} />

        <ReferralSummaryCard
          ageGroup={referral.ageGroup}
          symptoms={referral.symptoms}
          vitals={referral.vitals}
        />

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onAdvanceStatus}
            disabled={isConfirmed}
            className={[
              'min-h-14 rounded-xl text-lg font-bold cursor-pointer transition-colors duration-150',
              'bg-accent text-accent-foreground',
              'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            {isConfirmed ? 'Referral complete' : `Mark as ${nextLabel(referral.status)}`}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            In production, the patient or receiving facility taps this same "Confirm Arrival"
            step directly on the referral link — no hospital-side software required.
          </p>
        </div>
      </main>
    </div>
  );
}

function nextLabel(status) {
  if (status === REFERRAL_STATUS.DRAFT) return 'Sent';
  if (status === REFERRAL_STATUS.SENT) return 'Confirmed Received';
  return 'Complete';
}
