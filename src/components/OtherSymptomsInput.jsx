import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

/**
 * OtherSymptomsInput
 *
 * Free-text escape hatch for a symptom that isn't in SYMPTOM_OPTIONS.
 * Each added entry is checked (see symptomTextMatcher.js) against the
 * SAME fixed checklist vocabulary triageEngine.js already evaluates —
 * an exact phrasing match auto-ticks the real checklist item (visible
 * elsewhere on the screen) so it goes through the real rule engine, and
 * that match is surfaced here as "matched to: X" so the pharmacist can
 * see and, if it's wrong, just untick the auto-ticked item themselves.
 * Unmatched entries stay informational-only, same as before this
 * matching existed. Visible label (not placeholder-only) per
 * ux-guidelines Forms/Input Labels.
 */
export function OtherSymptomsInput({ items, onAdd, onRemove }) {
  const [text, setText] = useState('');

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="other-symptom-input" className="text-sm font-bold text-muted-foreground">
        Other symptom not listed above
      </label>
      <div className="flex gap-2">
        <input
          id="other-symptom-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="e.g. joint pain"
          className={[
            'flex-1 min-h-12 px-3 rounded-lg border-2 border-border bg-card text-card-foreground text-base',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
          ].join(' ')}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!text.trim()}
          className={[
            'min-h-12 px-4 rounded-lg font-bold text-base cursor-pointer touch-manipulation',
            'bg-accent text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
          ].join(' ')}
        >
          Add
        </button>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item.text}>
              <span
                className={[
                  'inline-flex items-center gap-1.5 min-h-9 pl-3 pr-2 rounded-full border-2 text-sm font-bold',
                  item.match
                    ? 'bg-primary/10 border-primary text-card-foreground'
                    : 'bg-card border-border text-card-foreground',
                ].join(' ')}
              >
                {item.match && (
                  <CheckCircle2 aria-hidden="true" size={14} className="text-primary shrink-0" />
                )}
                <span>
                  {item.text}
                  {item.match && (
                    <span className="font-normal text-muted-foreground"> → matched: {item.match.label}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.text)}
                  aria-label={`Remove ${item.text}`}
                  className="rounded-full p-0.5 hover:bg-border cursor-pointer touch-manipulation"
                >
                  <X aria-hidden="true" size={14} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Recognized phrasing automatically ticks the matching checklist item above, so it's
        included in red-flag checks. Anything not recognized is recorded on the referral note
        only — it isn't evaluated.
      </p>
    </div>
  );
}
