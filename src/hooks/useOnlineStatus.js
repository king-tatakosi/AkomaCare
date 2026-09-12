import { useEffect, useState } from 'react';

/**
 * useOnlineStatus
 *
 * Small standalone hook (not folded into useChat) because the
 * online/offline boundary is a concept other future online-only
 * features will also need, per the architecture plan: offline-first
 * checklist/referral/SMS flow stays fully unaffected either way, and
 * anything online-only just needs to know this one boolean.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}
