"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  applicationId: string;
  onNext?: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  nextLabel?: string;
}

export function WizardNavigation({
  currentStep,
  applicationId,
  onNext,
  onPrevious,
  isLoading = false,
  showPrevious = true,
  showNext = true,
  nextLabel = "Next",
}: WizardNavigationProps) {
  const router = useRouter();

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else if (currentStep > 1) {
      router.push(`/applications/${applicationId}/edit/step-${currentStep - 1}`);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (currentStep < 4) {
      router.push(`/applications/${applicationId}/edit/step-${currentStep + 1}`);
    }
  };

  return (
    <div className="flex items-center justify-between border-t bg-white px-6 py-4">
      {showPrevious && currentStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isLoading}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      ) : (
        <div />
      )}

      {showNext && (
        <Button
          type="submit"
          disabled={isLoading}
          onClick={onNext ? handleNext : undefined}
        >
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              {nextLabel}
              {currentStep < 4 && <ChevronRight className="ml-2 h-4 w-4" />}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
