import {
  SYMPTOM_OPTIONS,
  DANGER_SIGN_OPTIONS,
  AGE_GROUP,
  MRDT_RESULT,
} from '../lib/triageEngine';
import { SymptomChip } from '../components/SymptomChip';
import { OtherSymptomsInput } from '../components/OtherSymptomsInput';
import { VitalsField } from '../components/VitalsField';
import { RedFlagBanner } from '../components/RedFlagBanner';
import { AgeGroupToggle } from '../components/AgeGroupToggle';
import { SegmentedToggle } from '../components/SegmentedToggle';
import { PrescribingGuidanceCard } from '../components/PrescribingGuidanceCard';
import { WifiOff, Info, MessageCircle, AlertOctagon } from 'lucide-react';

const MRDT_OPTIONS = [
  { id: MRDT_RESULT.NOT_DONE, label: 'Not Done' },
  { id: MRDT_RESULT.NEGATIVE, label: 'Negative' },
  { id: MRDT_RESULT.POSITIVE, label: 'Positive' },
];

const PREGNANCY_OPTIONS = [
  { id: 'no', label: 'Not Pregnant' },
  { id: 'yes', label: 'Pregnant' },
];

/**
 * Compact decision-footer copy — mirrors RedFlagBanner's own severity
 * config, but this is a SEPARATE small object on purpose: the footer
 * needs a short label ("Refer now"), RedFlagBanner needs a full one
 * ("REFER NOW — emergency"). Keeping them separate avoids one string
 * having to serve two very different space constraints.
 */
const FOOTER_CONFIG = {
  emergency: { dot: 'bg-emergency', label: 'Emergency — refer now', button: 'bg-emergency text-emergency-foreground' },
  urgent: { dot: 'bg-urgent', label: 'Refer to doctor/nurse', button: 'bg-accent text-accent-foreground' },
  routine: { dot: 'bg-routine', label: 'Safe to dispense', button: 'bg-routine text-routine-foreground' },
};

/**
 * TriageChecklist — the pharmacist-facing point-of-care screen.
 *
 * Layout is a fixed-viewport shell (shrink-0 header, flex-1 scrolling
 * main, shrink-0 footer) — the same pattern ChatScreen uses — rather
 * than one long native-scrolling page. Two things this fixes, per
 * design-critique session: (1) the chat entry point in the header was
 * unreachable once scrolled past it; (2) reaching the decision button
 * required a full scroll down, and re-checking the live red-flag state
 * meant scrolling back up. The footer now carries a compact, always-
 * visible version of both — full detail still lives in RedFlagBanner
 * at the top of the scroll area.
 *
 * Triage state lives in App.jsx (the composition root) so the same
 * ageGroup/symptoms/vitals/context/result can be handed to the referral
 * screen without re-deriving them. This component only arranges the
 * widgets and reads `result`; it never calls evaluateTriage() itself.
 */
export function TriageChecklist({
  ageGroup,
  setAgeGroup,
  symptoms,
  toggleSymptom,
  vitals,
  setVital,
  pregnant,
  setPregnant,
  mrdt,
  setMrdt,
  dangerSigns,
  toggleDangerSign,
  otherSymptoms,
  addOtherSymptom,
  removeOtherSymptom,
  result,
  onGenerateReferral,
  onAcknowledgeDispense,
  onOpenChat,
}) {
  const footer = FOOTER_CONFIG[result.overallSeverity];
  const isDisabled = symptoms.size === 0 && otherSymptoms.length === 0;
  const footerButtonLabel =
    result.overallSeverity === 'emergency'
      ? 'Generate Emergency Referral'
      : result.decision === 'refer'
        ? 'Generate Referral'
        : 'Confirm Dispense';

  return (
    <div className="h-dvh flex flex-col bg-background">
      <header className="shrink-0 bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight truncate">AkomaCare</h1>
          <p className="text-sm opacity-90 truncate">GHS Standard Treatment Guidelines</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex items-center gap-1 text-xs font-bold bg-black/15 rounded-full px-3 py-1">
            <WifiOff aria-hidden="true" size={14} />
            Offline mode
          </span>
          {/* Labeled pill, not an icon-only button — an icon alone here was
              getting missed entirely on first visits (design-critique
              session). Matches the existing pill shape used for the
              Offline mode badge so it reads as part of the same header
              idiom rather than a new visual pattern. */}
          <button
            type="button"
            onClick={onOpenChat}
            aria-label="Open guideline chat"
            className="min-h-12 flex items-center gap-2 rounded-full bg-black/15 hover:bg-black/25 px-4 text-sm font-bold cursor-pointer touch-manipulation transition-colors duration-150 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
          >
            <MessageCircle aria-hidden="true" size={20} />
            Ask
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 py-5">
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          {/* Live red-flag result — full detail lives here; the footer below
              only ever shows a compact summary of the same state. */}
          <RedFlagBanner result={result} />
          <PrescribingGuidanceCard guidance={result.prescribingGuidance} />

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Patient
            </h2>
            <div className="flex flex-wrap gap-4">
              <AgeGroupToggle value={ageGroup} onChange={setAgeGroup} />
              {ageGroup === AGE_GROUP.ADULT && (
                <SegmentedToggle
                  label="Pregnancy status"
                  value={pregnant ? 'yes' : 'no'}
                  options={PREGNANCY_OPTIONS}
                  onChange={(v) => setPregnant(v === 'yes')}
                />
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Symptoms — tick all that apply
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <SymptomChip
                  key={s.id}
                  id={`symptom-${s.id}`}
                  label={s.label}
                  selected={symptoms.has(s.id)}
                  onToggle={() => toggleSymptom(s.id)}
                />
              ))}
            </div>
            <OtherSymptomsInput
              items={otherSymptoms}
              onAdd={addOtherSymptom}
              onRemove={removeOtherSymptom}
            />
          </section>

          {symptoms.has('fever') && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Malaria RDT Result
              </h2>
              <SegmentedToggle label="" value={mrdt} options={MRDT_OPTIONS} onChange={setMrdt} />
            </section>
          )}

          {/* Danger Signs get a visually distinct container — same amber
              "pay closer attention" tint PrescribingGuidanceCard already
              uses, not the red reserved for RedFlagBanner — so this section
              reads as higher-stakes at a glance, not just by its heading text. */}
          <section className="rounded-xl border-2 border-urgent/30 bg-amber-50/40 p-3 flex flex-col gap-3">
            <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-urgent">
              <AlertOctagon aria-hidden="true" size={16} />
              Danger Signs — tick any that apply
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {DANGER_SIGN_OPTIONS.map((d) => (
                <SymptomChip
                  key={d.id}
                  id={`danger-${d.id}`}
                  label={d.label}
                  selected={dangerSigns.has(d.id)}
                  onToggle={() => toggleDangerSign(d.id)}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Vitals — optional
            </h2>
            <div className="flex items-start gap-2 rounded-lg bg-muted border border-border px-3 py-2">
              <Info aria-hidden="true" size={16} className="text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-snug">
                No BP cuff or thermometer on hand? Skip this section — the symptom and danger-sign
                checklists above already cover the referral decision on their own, and nothing here
                blocks you from continuing. If you do have the equipment, entering a reading adds a
                few extra checks (e.g. dangerously high blood pressure) on top of the checklist.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <VitalsField
                id="bp-systolic"
                label="BP Systolic"
                unit="mmHg"
                placeholder="120"
                value={vitals.bpSystolic}
                onChange={(v) => setVital('bpSystolic', v)}
              />
              <VitalsField
                id="bp-diastolic"
                label="BP Diastolic"
                unit="mmHg"
                placeholder="80"
                value={vitals.bpDiastolic}
                onChange={(v) => setVital('bpDiastolic', v)}
              />
              <VitalsField
                id="temp"
                label="Temperature"
                unit="°C"
                placeholder="37.0"
                value={vitals.tempC}
                onChange={(v) => setVital('tempC', v)}
              />
              <VitalsField
                id="pulse"
                label="Pulse"
                unit="bpm"
                placeholder="72"
                value={vitals.pulse}
                onChange={(v) => setVital('pulse', v)}
              />
              {ageGroup === AGE_GROUP.PEDIATRIC && (
                <VitalsField
                  id="fever-days"
                  label="Fever duration"
                  unit="days"
                  placeholder="0"
                  value={vitals.feverDays}
                  onChange={(v) => setVital('feverDays', v)}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Sticky decision footer — compact mirror of RedFlagBanner + the
          single dispense/refer action, always reachable without scrolling. */}
      <footer className="shrink-0 border-t-2 border-border bg-card px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <span aria-hidden="true" className={`w-3 h-3 rounded-full shrink-0 ${footer.dot}`} />
          <span className="flex-1 min-w-0 text-sm font-bold text-card-foreground truncate">
            {footer.label}
          </span>
          <button
            type="button"
            disabled={isDisabled}
            onClick={result.decision === 'refer' ? onGenerateReferral : onAcknowledgeDispense}
            className={[
              'min-h-12 shrink-0 px-4 rounded-xl text-sm font-bold cursor-pointer transition-colors duration-150',
              'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              footer.button,
            ].join(' ')}
          >
            {footerButtonLabel}
          </button>
        </div>
      </footer>
    </div>
  );
}
