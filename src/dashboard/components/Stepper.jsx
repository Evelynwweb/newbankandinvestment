import { Check } from 'lucide-react';

/* ============================================================
   Horizontal step indicator for the deposit / withdrawal / transfer
   wizards. `steps` is an array of labels; `current` is the 0-based
   active index.
   ============================================================ */
export default function Stepper({ steps, current }) {
  return (
    <div className="dash-stepper">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'todo';
        return (
          <div className="dash-step" key={label}>
            <div className="dash-step-dot" data-state={state}>
              {state === 'done' ? <Check size={16} strokeWidth={3} /> : i + 1}
            </div>
            <span className="dash-step-label" data-state={state === 'active' ? 'active' : undefined}>{label}</span>
            {i < steps.length - 1 && (
              <div className="dash-step-line" data-filled={i < current} />
            )}
          </div>
        );
      })}
    </div>
  );
}
