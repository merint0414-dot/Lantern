import { Check } from "lucide-react";

export default function StepIndicator({ steps = [], currentStepIndex = 0, onStepClick }) {
  return (
    <nav className="step-indicator-wrapper" aria-label="Progress tracker">
      <ol className="step-indicator-list">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <li
              key={step.id || index}
              className={`step-indicator-item ${
                isCompleted ? "completed" : isCurrent ? "current" : "upcoming"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="step-node-col">
                <button
                  type="button"
                  className="step-circle"
                  onClick={() => {
                    if (isCompleted && onStepClick) {
                      onStepClick(index);
                    }
                  }}
                  disabled={!isCompleted || !onStepClick}
                  aria-label={`Step ${index + 1}: ${step.title}. Status: ${
                    isCompleted ? "Completed, click to modify" : isCurrent ? "Current step" : "Upcoming"
                  }`}
                  data-lantern-step={index + 1}
                  data-lantern-action={`goto-step-${index + 1}`}
                  data-lantern-label={step.title}
                >
                  {isCompleted ? (
                    <Check size={16} className="check-icon" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                <div className="step-text-wrap">
                  <span className="step-label-num">Step {index + 1}</span>
                  <span className="step-label-title">{step.title}</span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`step-connector-line ${isCompleted ? "filled" : ""}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
