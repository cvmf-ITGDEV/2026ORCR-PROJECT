import { useState, useEffect, useCallback, useRef } from "react";
import { autosaveData } from "@/app/actions/application";
import { AutosaveStatus } from "@/types/application";

interface UseAutosaveOptions {
  applicationId: string;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

export function useAutosave({
  applicationId,
  debounceMs = 2000,
  onSaveSuccess,
  onSaveError,
}: UseAutosaveOptions) {
  const [status, setStatus] = useState<AutosaveStatus>({
    status: "idle",
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<Record<string, any>>({});

  const save = useCallback(async () => {
    if (Object.keys(pendingDataRef.current).length === 0) {
      return;
    }

    setStatus({ status: "saving" });

    try {
      const result = await autosaveData(applicationId, pendingDataRef.current);

      if (result.success) {
        setStatus({
          status: "saved",
          lastSavedAt: new Date(),
        });
        onSaveSuccess?.();
        pendingDataRef.current = {};
      } else {
        setStatus({
          status: "error",
          message: result.message || "Failed to save",
        });
        onSaveError?.(result.message || "Failed to save");
      }
    } catch (error) {
      setStatus({
        status: "error",
        message: "Failed to save",
      });
      onSaveError?.("Failed to save");
    }
  }, [applicationId, onSaveSuccess, onSaveError]);

  const triggerAutosave = useCallback(
    (data: Record<string, any>) => {
      pendingDataRef.current = {
        ...pendingDataRef.current,
        ...data,
      };

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        save();
      }, debounceMs);
    },
    [save, debounceMs]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    triggerAutosave,
    saveNow: save,
  };
}
