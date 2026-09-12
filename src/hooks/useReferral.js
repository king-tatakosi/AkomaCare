import { useCallback, useState } from 'react';
import { buildReferralDraft, nextStatus } from '../lib/referral';

/**
 * useReferral
 *
 * Shallow interface over the referral module. Holds at most one
 * referral at a time (this screen's scope); the dashboard/list view
 * later will hold many and can reuse buildReferralDraft/nextStatus
 * without duplicating the state machine.
 */
export function useReferral() {
  const [referral, setReferral] = useState(null);

  const generate = useCallback((triageState) => {
    setReferral(buildReferralDraft(triageState));
  }, []);

  const advanceStatus = useCallback(() => {
    setReferral((prev) => (prev ? { ...prev, status: nextStatus(prev.status) } : prev));
  }, []);

  const reset = useCallback(() => setReferral(null), []);

  return { referral, generate, advanceStatus, reset };
}
