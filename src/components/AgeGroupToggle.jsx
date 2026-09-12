import { AGE_GROUP } from '../lib/triageEngine';

/**
 * AgeGroupToggle — segmented control, tap-first. Determines which
 * red-flag rules apply (e.g. pediatric fever threshold only fires here).
 */
export function AgeGroupToggle({ value, onChange }) {
  const options = [
    { id: AGE_GROUP.ADULT, label: 'Adult' },
    { id: AGE_GROUP.PEDIATRIC, label: 'Child' },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Patient age group"
      className="inline-flex rounded-lg border-2 border-border bg-card p-1 gap-1"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={[
            'min-h-11 min-w-24 rounded-md text-base font-bold cursor-pointer',
            'transition-colors duration-150 touch-manipulation',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
            value === opt.id
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
