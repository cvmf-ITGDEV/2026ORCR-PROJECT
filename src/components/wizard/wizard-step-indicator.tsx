import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "@/types/application";

interface WizardStepIndicatorProps {
  currentStep: number;
}

export function WizardStepIndicator({ currentStep }: WizardStepIndicatorProps) {
  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = currentStep > step.step;
            const isCurrent = currentStep === step.step;
            const isAccessible = currentStep >= step.step;

            return (
              <div key={step.step} className="relative flex flex-1 flex-col items-center">
                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-1/2 top-5 h-0.5 w-full -translate-y-1/2",
                      isCompleted ? "bg-blue-600" : "bg-gray-300"
                    )}
                    style={{ zIndex: 0 }}
                  />
                )}

                <div className="relative z-10 mb-2 flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-sm font-semibold transition-colors",
                      isCompleted &&
                        "border-blue-600 bg-blue-600 text-white",
                      isCurrent &&
                        "border-blue-600 text-blue-600",
                      !isAccessible &&
                        "border-gray-300 text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.step
                    )}
                  </div>

                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCurrent && "text-blue-600",
                        isCompleted && "text-gray-900",
                        !isAccessible && "text-gray-400"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
