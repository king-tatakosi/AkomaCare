import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

const MAX_HEIGHT_PX = 120;

/**
 * ChatComposer
 *
 * Auto-resizing textarea + send button. Enter sends, Shift+Enter makes
 * a newline. `disabled` covers both "offline" and "a reply is already
 * in flight" — ChatScreen decides which, this component just renders
 * the disabled state and doesn't need to know why.
 */
export function ChatComposer({ onSend, disabled, placeholder = 'Ask about this guidance…' }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    const next = Math.min(el.scrollHeight, MAX_HEIGHT_PX);
    el.style.height = `${next}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className="shrink-0 border-t-2 border-border bg-card px-3 py-3">
      <div className="max-w-xl mx-auto flex items-end gap-2">
        <label htmlFor="chat-composer-input" className="sr-only">
          Ask about screening guidance
        </label>
        <textarea
          id="chat-composer-input"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className={[
            'flex-1 resize-none rounded-xl border-2 border-border bg-background px-3.5 py-2.5',
            'text-sm text-foreground placeholder:text-muted-foreground overflow-y-auto',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || value.trim().length === 0}
          aria-label="Send message"
          className={[
            'min-h-11 min-w-11 flex items-center justify-center rounded-xl cursor-pointer touch-manipulation shrink-0',
            'bg-accent text-accent-foreground transition-colors duration-150',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          <Send aria-hidden="true" size={18} />
        </button>
      </div>
    </div>
  );
}
