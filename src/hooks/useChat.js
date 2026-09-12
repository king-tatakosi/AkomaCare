import { useCallback, useState } from 'react';
import { sendChatMessage } from '../lib/chatClient';

/**
 * useChat
 *
 * Sole interface between the chat UI and chatClient.js, mirroring how
 * useTriageEngine.js is the sole interface onto triageEngine.js — the
 * screen/components never call sendChatMessage directly.
 *
 * Deliberately holds only in-memory state for now. The architecture
 * plan allows Dexie to cache past answers for offline re-reading
 * later; that's a separate, additive persistence layer, not something
 * this hook needs to know about to be useful today.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [error, setError] = useState(null);

  const send = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || status === 'sending') return;

      const userMessage = { id: `user-${Date.now()}`, role: 'user', text: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setStatus('sending');
      setError(null);

      try {
        const reply = await sendChatMessage({ text: trimmed });
        setMessages((prev) => [...prev, reply]);
        setStatus('idle');
      } catch {
        setError('Could not reach guideline chat. Please try again.');
        setStatus('error');
      }
    },
    [status]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setStatus('idle');
    setError(null);
  }, []);

  return { messages, status, error, send, reset };
}
