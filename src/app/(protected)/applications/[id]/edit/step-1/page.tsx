"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDraftApplication, saveStep1Data } from "@/app/actions/application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardStepCard, WizardNavigation, AutosaveIndicator } from "@/components/wizard";
import { useAutosave } from "@/hooks/use-autosave";
import { ApplicationDTO } from "@/types/application";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Step1PageProps {
  params: { id: string };
}

export default function Step1Page({ params }: Step1PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState<ApplicationDTO | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    borrowerFirstName: "",
    borrowerMiddleName: "",
    borrowerLastName: "",
    borrowerEmail: "",
    borrowerPhone: "",
  });

  const { status, triggerAutosave } = useAutosave({
    applicationId: params.id,
    onSaveSuccess: () => {
      toast({
        title: "Autosaved",
        description: "Your changes have been saved.",
      });
    },
  });

  useEffect(() => {
    async function fetchApplication() {
      setIsFetching(true);
      const app = await getDraftApplication(params.id);
      if (app) {
        setApplication(app);
        setFormData({
          borrowerFirstName: app.borrowerFirstName || "",
          borrowerMiddleName: app.borrowerMiddleName || "",
          borrowerLastName: app.borrowerLastName || "",
          borrowerEmail: app.borrowerEmail || "",
          borrowerPhone: app.borrowerPhone || "",
        });
      }
      setIsFetching(false);
    }
    fetchApplication();
  }, [params.id]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));

    triggerAutosave({
      step1: {
        ...formData,
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    const result = await saveStep1Data(params.id, formDataObj);

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      router.push(`/applications/${params.id}/edit/step-2`);
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message || "Failed to save personal information",
      });
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <WizardStepCard
        title="Personal Information"
        description="Please provide your basic personal details"
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </WizardStepCard>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <WizardStepCard
        title="Personal Information"
        description="Please provide your basic personal details"
      >
        <div className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Please correct the errors below and try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="borrowerFirstName">
                First Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="borrowerFirstName"
                name="borrowerFirstName"
                value={formData.borrowerFirstName}
                onChange={(e) => handleFieldChange("borrowerFirstName", e.target.value)}
                placeholder="Juan"
                disabled={isLoading}
                className={errors.borrowerFirstName ? "border-red-500" : ""}
              />
              {errors.borrowerFirstName && (
                <p className="text-sm text-red-600">{errors.borrowerFirstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrowerMiddleName">Middle Name</Label>
              <Input
                id="borrowerMiddleName"
                name="borrowerMiddleName"
                value={formData.borrowerMiddleName}
                onChange={(e) => handleFieldChange("borrowerMiddleName", e.target.value)}
                placeholder="Santos"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrowerLastName">
              Last Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="borrowerLastName"
              name="borrowerLastName"
              value={formData.borrowerLastName}
              onChange={(e) => handleFieldChange("borrowerLastName", e.target.value)}
              placeholder="Dela Cruz"
              disabled={isLoading}
              className={errors.borrowerLastName ? "border-red-500" : ""}
            />
            {errors.borrowerLastName && (
              <p className="text-sm text-red-600">{errors.borrowerLastName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrowerEmail">
              Email Address <span className="text-red-600">*</span>
            </Label>
            <Input
              id="borrowerEmail"
              name="borrowerEmail"
              type="email"
              value={formData.borrowerEmail}
              onChange={(e) => handleFieldChange("borrowerEmail", e.target.value)}
              placeholder="juan.delacruz@email.com"
              disabled={isLoading}
              className={errors.borrowerEmail ? "border-red-500" : ""}
            />
            {errors.borrowerEmail && (
              <p className="text-sm text-red-600">{errors.borrowerEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrowerPhone">
              Phone Number <span className="text-red-600">*</span>
            </Label>
            <Input
              id="borrowerPhone"
              name="borrowerPhone"
              type="tel"
              value={formData.borrowerPhone}
              onChange={(e) => handleFieldChange("borrowerPhone", e.target.value)}
              placeholder="09123456789"
              disabled={isLoading}
              className={errors.borrowerPhone ? "border-red-500" : ""}
            />
            {errors.borrowerPhone && (
              <p className="text-sm text-red-600">{errors.borrowerPhone}</p>
            )}
            <p className="text-xs text-gray-500">
              Format: 09XXXXXXXXX (Philippine mobile number)
            </p>
          </div>

          <AutosaveIndicator status={status} />
        </div>
      </WizardStepCard>

      <WizardNavigation
        currentStep={1}
        applicationId={params.id}
        isLoading={isLoading}
        showPrevious={false}
      />
    </form>
  );
}
