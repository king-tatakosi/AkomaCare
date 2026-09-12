import { BookOpenCheck, User } from 'lucide-react';

/**
 * ChatMessageBubble
 *
 * User turns get a plain right-aligned bubble. Assistant turns are
 * deliberately NOT styled like a generic chatbot — they carry a small
 * "GHS STG" badge icon (same BookOpenCheck used by
 * PrescribingGuidanceCard) to keep reinforcing that this is cited
 * guideline explanation, not freeform advice. No color from the
 * severity palette (emergency/urgent/routine) is used here — those are
 * reserved for RedFlagBanner per that component's own convention.
 */
export function ChatMessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex items-start gap-2">
          <p className="min-h-11 flex items-center rounded-2xl bg-muted px-3.5 py-2 text-sm text-foreground whitespace-pre-wrap break-words">
            {message.text}
          </p>
          <span className="mt-1 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground shrink-0">
            <User aria-hidden="true" size={14} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] flex items-start gap-2">
        <span className="mt-1 flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent shrink-0">
          <BookOpenCheck aria-hidden="true" size={14} />
        </span>
        <div className="rounded-2xl bg-card border-2 border-border px-3.5 py-2.5">
          <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
          {message.citations?.length > 0 && (
            <ul className="mt-2 pt-2 border-t border-border flex flex-col gap-0.5">
              {message.citations.map((c, i) => (
                <li key={i} className="text-xs text-muted-foreground italic">
                  Source: {c}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
