import { SYMPTOM_OPTIONS } from '../lib/triageEngine';

const VITALS_META = [
  { key: 'bpSystolic', label: 'BP Systolic', unit: 'mmHg' },
  { key: 'bpDiastolic', label: 'BP Diastolic', unit: 'mmHg' },
  { key: 'tempC', label: 'Temperature', unit: '°C' },
  { key: 'pulse', label: 'Pulse', unit: 'bpm' },
  { key: 'feverDays', label: 'Fever duration', unit: 'days' },
];

/**
 * ReferralSummaryCard
 *
 * Read-only recap of what's being referred, so the pharmacist can
 * verify the slip/QR matches what they actually screened before
 * handing it to the patient. Deliberately not editable here — going
 * back to the checklist is the only way to change these values, so
 * there's one place the data can be wrong, not two.
 */
export function ReferralSummaryCard({ ageGroup, symptoms, vitals }) {
  const symptomLabels = SYMPTOM_OPTIONS.filter((s) => symptoms.includes(s.id)).map(
    (s) => s.label
  );
  const recordedVitals = VITALS_META.filter((v) => vitals[v.key] != null);

  return (
    <div className="bg-card border-2 border-border rounded-xl p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
          Patient
        </h3>
        <p className="font-bold capitalize">{ageGroup}</p>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
          Symptoms
        </h3>
        {symptomLabels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {symptomLabels.map((label) => (
              <span
                key={label}
                className="text-sm font-bold bg-muted text-muted-foreground rounded-full px-3 py-1"
              >
                {label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">None recorded</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
          Vitals
        </h3>
        {recordedVitals.length > 0 ? (
          <dl className="grid grid-cols-2 gap-2">
            {recordedVitals.map((v) => (
              <div key={v.key}>
                <dt className="text-xs text-muted-foreground">{v.label}</dt>
                <dd className="font-bold">
                  {vitals[v.key]} <span className="font-normal text-sm">{v.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">None recorded</p>
        )}
      </div>
    </div>
  );
}
