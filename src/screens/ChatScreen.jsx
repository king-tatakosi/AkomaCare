import { useEffect, useRef } from 'react';
import { ArrowLeft, WifiOff, Info, BookOpenCheck } from 'lucide-react';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ChatComposer } from '../components/ChatComposer';
import { SUGGESTED_QUESTIONS } from '../lib/chatClient';

/**
 * ChatScreen
 *
 * Online-only, additive, and narrowly scoped on purpose (see
 * chatClient.js doc comment): this explains cited GHS STG guidance
 * already surfaced in the checklist/referral flow, not an open medical
 * Q&A surface. That scope is stated up front in the banner below, not
 * left implicit, because the scope-of-practice question is still an
 * open legal item for this project.
 *
 * isOnline is a prop, not read here, so this component stays testable
 * without mocking navigator — App.jsx wires it from useOnlineStatus.
 */
export function ChatScreen({ messages, status, error, isOnline, onSend, onBack }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, status]);

  const isEmpty = messages.length === 0;
  const composerDisabled = !isOnline || status === 'sending';

  return (
    <div className="h-dvh flex flex-col bg-background">
      <header className="shrink-0 bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to screening"
          className="min-h-11 min-w-11 flex items-center justify-center rounded-lg cursor-pointer touch-manipulation focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
        >
          <ArrowLeft aria-hidden="true" size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold leading-tight">Guideline Chat</h1>
          <p className="text-sm opacity-90">GHS STG — explains cited guidance</p>
        </div>
        {!isOnline && (
          <span className="flex items-center gap-1 text-xs font-bold bg-black/15 rounded-full px-3 py-1">
            <WifiOff aria-hidden="true" size={14} />
            Offline
          </span>
        )}
      </header>

      <div className="shrink-0 max-w-xl w-full mx-auto px-4 pt-4">
        <div className="flex items-start gap-2 rounded-lg bg-muted border border-border px-3 py-2">
          <Info aria-hidden="true" size={16} className="text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-snug">
            This chat only explains guidance already shown in your screening — it doesn't
            diagnose, prescribe, or override the checklist. Any red flag from your current
            screening stays in effect no matter what's asked here.
          </p>
        </div>
      </div>

      <main
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          {isEmpty ? (
            <div className="flex flex-col items-center text-center gap-3 py-8">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent">
                <BookOpenCheck aria-hidden="true" size={22} />
              </span>
              <p className="text-sm text-muted-foreground max-w-xs">
                Ask a question about the GHS STG guidance behind your screening result.
              </p>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onSend(q)}
                    disabled={composerDisabled}
                    className={[
                      'text-left text-sm rounded-xl border-2 border-border bg-card px-3.5 py-2.5',
                      'text-card-foreground cursor-pointer transition-colors duration-150 hover:border-accent',
                      'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                    ].join(' ')}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <ChatMessageBubble key={m.id} message={m} />)
          )}

          {status === 'sending' && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-card border-2 border-border px-3.5 py-2.5">
                <span className="flex gap-1" role="status" aria-label="Assistant is typing">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                </span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div role="alert" className="rounded-xl border-2 border-urgent/30 bg-amber-50 px-3.5 py-2.5">
              <p className="text-sm text-foreground">{error}</p>
            </div>
          )}
        </div>
      </main>

      {isOnline ? (
        <ChatComposer onSend={onSend} disabled={composerDisabled} />
      ) : (
        <div className="shrink-0 border-t-2 border-border bg-card px-4 py-4 flex items-center gap-2">
          <WifiOff aria-hidden="true" size={16} className="text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Guideline chat needs a connection. Everything else in the app — screening, red flags,
            and referrals — keeps working offline as normal.
          </p>
        </div>
      )}
    </div>
  );
}
