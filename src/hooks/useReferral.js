import { useCallback, useState } from 'react';
import { buildReferralDraft } from '../lib/referral';
import { addLogEntry, markLogEntrySent } from '../lib/referralLog';

/**
 * useReferral
 *
 * Shallow interface over the referral module. Holds at most one
 * referral at a time. `sent` is a single boolean the pharmacist sets
 * themselves after tapping "Send SMS".
 *
 * Also the sole place that writes to referralLog — ReferralScreen and
 * App.jsx never touch Dexie directly, same "one findable place" rule
 * already applied to triageEngine.js. `generate` fires the Dexie write
 * as a side effect and keeps the returned logId privately in state so
 * `markSent` can flip the right row without the caller needing to know
 * a Dexie id exists at all.
 */
export function useReferral() {
  const [referral, setReferral] = useState(null);
  const [logId, setLogId] = useState(null);

  const generate = useCallback((triageState) => {
    const draft = buildReferralDraft(triageState);
    setReferral(draft);
    setLogId(null);
    addLogEntry(draft)
      .then(setLogId)
      .catch((err) => {
        // Logging failure should never block the actual referral flow —
        // the pharmacist can still see the note and send the SMS even if
        // this on-device audit write fails for some reason.
        console.error('Could not write referral log entry:', err);
      });
  }, []);

  const markSent = useCallback(() => {
    setReferral((prev) => (prev ? { ...prev, sent: true } : prev));
    markLogEntrySent(logId).catch((err) => {
      console.error('Could not update referral log entry:', err);
    });
  }, [logId]);

  const reset = useCallback(() => {
    setReferral(null);
    setLogId(null);
  }, []);

  return { referral, generate, markSent, reset };
}
