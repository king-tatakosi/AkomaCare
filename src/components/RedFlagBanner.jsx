import { AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

/**
 * RedFlagBanner
 *
 * The one visual outcome the whole screen exists to produce. Updates
 * live as chips/vitals change (no submit click). role="alert" only on
 * the emergency state so screen readers interrupt for a true red flag —
 * urgent/routine use aria-live="polite" so they don't hijack focus on
 * every keystroke (see ux-guidelines "Focusable Error Summary": don't
 * move focus on every blur/change).
 *
 * Each flag's citation is shown inline — this is the credibility signal
 * for judges/reviewers: every red flag traces to a named guideline, not
 * an unexplained black-box rule.
 */
export function RedFlagBanner({ result }) {
  const { flags, overallSeverity } = result;

  const config = {
    emergency: {
      icon: AlertTriangle,
      bg: 'bg-emergency',
      fg: 'text-emergency-foreground',
      title: 'REFER NOW — emergency',
      live: 'assertive',
      role: 'alert',
    },
    urgent: {
      icon: Clock,
      bg: 'bg-urgent',
      fg: 'text-urgent-foreground',
      title: 'Refer to a doctor/nurse — same-day',
      live: 'polite',
      role: 'status',
    },
    routine: {
      icon: ShieldCheck,
      bg: 'bg-routine',
      fg: 'text-routine-foreground',
      title: 'Safe to Dispense — no red flags detected',
      live: 'polite',
      role: 'status',
    },
  }[overallSeverity];

  const Icon = config.icon;

  return (
    <div
      role={config.role}
      aria-live={config.live}
      className={`${config.bg} ${config.fg} rounded-xl p-4 flex flex-col gap-2 transition-colors duration-200`}
    >
      <div className="flex items-center gap-2 font-bold text-lg">
        <Icon aria-hidden="true" size={24} />
        <span>{config.title}</span>
      </div>
      {flags.length > 0 && (
        <ul className="flex flex-col gap-2 pl-8 list-disc text-sm">
          {flags.map((flag) => (
            <li key={flag.id}>
              <span className="font-bold">{flag.label}.</span> {flag.reason}
              {flag.citation && (
                <span className="block text-xs opacity-80 italic mt-0.5">Source: {flag.citation}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
