import { Check } from 'lucide-react';
import { REFERRAL_STATUS } from '../lib/referral';

const STEPS = [
  { id: REFERRAL_STATUS.DRAFT, label: 'Drafted' },
  { id: REFERRAL_STATUS.SENT, label: 'Sent' },
  { id: REFERRAL_STATUS.CONFIRMED_RECEIVED, label: 'Confirmed received' },
];

/**
 * ReferralStatusTimeline
 *
 * Renders the draft -> sent -> confirmed-received lifecycle from
 * lib/referral.js. A single role="status" region announces the
 * current step as one atomic phrase on change (per ux-guidelines
 * "Contextual Live Badge Updates" — announce the meaning, not a bare
 * index), instead of three competing live regions.
 */
export function ReferralStatusTimeline({ status }) {
  const currentIndex = STEPS.findIndex((s) => s.id === status);

  return (
    <div>
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0',
                    'transition-colors duration-200',
                    done
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-card border-border text-muted-foreground',
                  ].join(' ')}
                >
                  {done ? <Check aria-hidden="true" size={16} /> : i + 1}
                </div>
                <span className="text-xs font-bold text-muted-foreground text-center w-20">
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'h-0.5 flex-1 mx-1 -mt-5 transition-colors duration-200',
                    i < currentIndex ? 'bg-primary' : 'bg-border',
                  ].join(' ')}
                />
              )}
            </div>
          );
        })}
      </div>
      <p role="status" aria-atomic="true" className="sr-only">
        Referral status: {STEPS[currentIndex]?.label}
      </p>
    </div>
  );
}
