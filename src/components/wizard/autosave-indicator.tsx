import { Check, Loader2, AlertCircle } from "lucide-react";
import { AutosaveStatus } from "@/types/application";
import { cn } from "@/lib/utils";

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  className?: string;
}

export function AutosaveIndicator({ status, className }: AutosaveIndicatorProps) {
  if (status.status === "idle") {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {status.status === "saving" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-gray-600">Saving...</span>
        </>
      )}

      {status.status === "saved" && (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">
            Saved
            {status.lastSavedAt &&
              ` at ${status.lastSavedAt.toLocaleTimeString()}`}
          </span>
        </>
      )}

      {status.status === "error" && (
        <>
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-600">
            {status.message || "Failed to save"}
          </span>
        </>
      )}
    </div>
  );
}
