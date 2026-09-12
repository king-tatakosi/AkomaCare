import { useEffect, useState } from 'react';
import { Timer, BookOpenCheck, Link2, WifiOff, ShieldCheck } from 'lucide-react';

const TIP_INTERVAL_MS = 4000;

/**
 * Value-prop tips shown on the splash screen. Every claim here is
 * something already true of the shipped app (see session decisions
 * log) — deliberately NOT using the "80% go to pharmacy first" stat,
 * since that figure was flagged unverified during competitive
 * research and shouldn't be repeated as fact in the product itself.
 */
const TIPS = [
  {
    icon: Timer,
    title: 'Under two minutes',
    body: 'Turn a symptom checklist into a structured referral without slowing down the counter.',
  },
  {
    icon: BookOpenCheck,
    title: 'Every flag is cited',
    body: 'Red flags and prescribing notes trace back to a named GHS guideline and edition year — never a made-up section number.',
  },
  {
    icon: Link2,
    title: 'Closed-loop referrals',
    body: 'Track a referral from draft to sent to confirmed received — not just a handoff you hope arrives.',
  },
  {
    icon: WifiOff,
    title: 'Works with no signal',
    body: 'The checklist, red flags, and referral note all run fully offline. No connection, no problem.',
  },
  {
    icon: ShieldCheck,
    title: 'Protects you too',
    body: "A timestamped screening decision is a record that backs you up, not just the patient, if a case is ever questioned.",
  },
];

/**
 * SplashScreen
 *
 * Shown once per session (gated in App.jsx via sessionStorage) before
 * the pharmacist reaches the checklist. Auto-rotates through TIPS;
 * tapping the card or a dot also advances/jumps manually. Purely
 * persuasive/informational — carries no app state and blocks nothing
 * once dismissed.
 */
export function SplashScreen({ onDismiss }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, TIP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const tip = TIPS[index];
  const Icon = tip.icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="shrink-0 bg-primary text-primary-foreground px-4 pt-4 pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold leading-tight">Dispense-or-Refer</h1>
          <p className="text-sm opacity-90 mt-1">A screening &amp; referral tool for LCS operators</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className={[
            'text-sm font-bold opacity-80 hover:opacity-100 cursor-pointer px-3 py-2 rounded-lg shrink-0',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white',
          ].join(' ')}
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % TIPS.length)}
          aria-label={`${tip.title}. Tap for next tip.`}
          className={[
            'w-full max-w-sm bg-card border-2 border-border rounded-2xl p-6 flex flex-col items-center gap-3',
            'cursor-pointer transition-colors duration-150 hover:border-primary',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
          ].join(' ')}
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
            <Icon aria-hidden="true" size={24} />
          </span>
          <span className="text-lg font-bold text-center text-card-foreground">{tip.title}</span>
          <span className="text-sm text-center text-muted-foreground leading-relaxed min-h-12">
            {tip.body}
          </span>
          <span aria-hidden="true" className="text-xs font-bold text-primary">
            Tap for next tip →
          </span>
        </button>

        <div className="flex gap-2">
          {TIPS.map((t, i) => (
            <button
              key={t.title}
              type="button"
              aria-label={`Show tip: ${t.title}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={[
                'h-2 rounded-full cursor-pointer transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
                i === index ? 'w-6 bg-primary' : 'w-2 bg-border',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 px-6 pb-8 pt-4">
        <button
          type="button"
          onClick={onDismiss}
          className={[
            'w-full min-h-14 rounded-xl text-lg font-bold cursor-pointer transition-colors duration-150',
            'bg-primary text-primary-foreground',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
          ].join(' ')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
