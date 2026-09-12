import { BookOpenCheck } from 'lucide-react';

/**
 * PrescribingGuidanceCard
 *
 * STG stewardship notes (e.g. "negative mRDT — antimalarial not
 * indicated"). Deliberately styled and worded as a CITED GUIDELINE
 * NOTE, not a directive — the app quotes what the guideline says and
 * lets the operator decide, rather than issuing a command. This
 * matters for scope-of-practice reasons: see triageEngine.js citation
 * policy notes. Amber, not red — this is stewardship guidance, not an
 * emergency flag, and should never compete visually with RedFlagBanner.
 */
export function PrescribingGuidanceCard({ guidance }) {
  if (!guidance || guidance.length === 0) return null;

  return (
    <div className="rounded-xl border-2 border-urgent/30 bg-amber-50 p-4 flex flex-col gap-3">
      {guidance.map((item) => (
        <div key={item.id} className="flex gap-3">
          <BookOpenCheck aria-hidden="true" size={20} className="text-urgent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground">{item.text}</p>
            <p className="text-xs text-muted-foreground mt-1 italic">Source: {item.citation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
