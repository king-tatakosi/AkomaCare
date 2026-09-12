import { useState } from 'react';
import { useTriageEngine } from './hooks/useTriageEngine';
import { useReferral } from './hooks/useReferral';
import { useChat } from './hooks/useChat';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { SplashScreen } from './screens/SplashScreen';
import { TriageChecklist } from './screens/TriageChecklist';
import { ReferralScreen } from './screens/ReferralScreen';
import { ChatScreen } from './screens/ChatScreen';

const SPLASH_SEEN_KEY = 'htw_seen_splash';

function hasSeenSplash() {
  if (typeof sessionStorage === 'undefined') return true;
  return sessionStorage.getItem(SPLASH_SEEN_KEY) === '1';
}

/**
 * App — composition root. Owns the triage + referral + chat hooks and
 * decides which screen is visible. No router yet; swap this for
 * react-router once there's a screen that needs deep-linking (e.g. a
 * referral list/dashboard).
 *
 * Screen precedence: splash (once per session) > chat (explicit
 * online-only detour) > referral (once generated) > checklist
 * (default). Chat and referral are mutually exclusive detours off the
 * checklist — going back from either always returns there.
 */
function App() {
  const [showSplash, setShowSplash] = useState(() => !hasSeenSplash());
  const [showChat, setShowChat] = useState(false);

  const triage = useTriageEngine();
  const { referral, generate, advanceStatus, reset } = useReferral();
  const chat = useChat();
  const isOnline = useOnlineStatus();

  const dismissSplash = () => {
    sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    setShowSplash(false);
  };

  const handleGenerateReferral = () => {
    generate({
      ageGroup: triage.ageGroup,
      symptoms: [...Array.from(triage.symptoms), ...triage.otherSymptoms.map((o) => o.text)],
      vitals: triage.vitals,
      pregnant: triage.pregnant,
      mrdt: triage.mrdt,
      dangerSigns: Array.from(triage.dangerSigns),
      result: triage.result,
    });
  };

  if (showSplash) {
    return <SplashScreen onDismiss={dismissSplash} />;
  }

  if (showChat) {
    return (
      <ChatScreen
        messages={chat.messages}
        status={chat.status}
        error={chat.error}
        isOnline={isOnline}
        onSend={chat.send}
        onBack={() => setShowChat(false)}
      />
    );
  }

  if (referral) {
    return (
      <ReferralScreen referral={referral} onAdvanceStatus={advanceStatus} onBack={reset} />
    );
  }

  return (
    <TriageChecklist
      {...triage}
      onGenerateReferral={handleGenerateReferral}
      onAcknowledgeDispense={triage.reset}
      onOpenChat={() => setShowChat(true)}
    />
  );
}

export default App;
