import { QRCodeSVG } from 'qrcode.react';
import { Copy } from 'lucide-react';
import { referralLookupUrl } from '../lib/referral';

/**
 * ReferralCodeDisplay
 *
 * The 6-digit code is the real fallback artifact — sayable, writable on
 * any scrap of paper, memorable with no phone, no app, and no scanner
 * required. It's always visible and large.
 *
 * The QR is demoted behind a closed-by-default <details> disclosure: it's
 * only useful to a hospital that both owns a scanner AND has something on
 * the other end of the URL to scan into — neither of which exists yet
 * (referralLookupUrl points at a placeholder domain with no backend). This
 * is a placeholder for a later phase, not a working feature today, and the
 * UI says so rather than implying otherwise.
 */
export function ReferralCodeDisplay({ code }) {
  const url = referralLookupUrl(code);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
  };

  return (
    <div className="bg-card border-2 border-border rounded-xl p-5 flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Referral Code
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-4xl font-bold tracking-[0.25em] text-foreground">
            {code}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy referral code"
            className={[
              'min-h-11 min-w-11 flex items-center justify-center rounded-lg cursor-pointer',
              'text-muted-foreground hover:text-primary transition-colors duration-150',
              'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
            ].join(' ')}
          >
            <Copy aria-hidden="true" size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Read this aloud or write it down — it works with no phone, no app, and no scanner.
        </p>
      </div>

      <details className="w-full">
        <summary
          className={[
            'text-xs font-bold uppercase tracking-wide text-muted-foreground cursor-pointer',
            'text-center list-none touch-manipulation select-none',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
          ].join(' ')}
        >
          For hospitals with a scanner
        </summary>
        <div className="flex flex-col items-center gap-2 pt-3">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={url} size={160} level="M" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Encodes <span className="font-bold">{url}</span> — a lookup page that doesn't exist
            yet. This is a placeholder for later, not a working feature today.
          </p>
        </div>
      </details>
    </div>
  );
}
