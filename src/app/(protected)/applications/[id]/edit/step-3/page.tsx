"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDraftApplication, saveStep3Data } from "@/app/actions/application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardStepCard, WizardNavigation, AutosaveIndicator } from "@/components/wizard";
import { useAutosave } from "@/hooks/use-autosave";
import { ApplicationDTO, LOAN_TERM_OPTIONS, calculateInterestRate } from "@/types/application";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Step3PageProps {
  params: { id: string };
}

export default function Step3Page({ params }: Step3PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    loanAmount: "",
    loanPurpose: "",
    loanTermMonths: "",
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
        setFormData({
          loanAmount: app.loanAmount > 0 ? app.loanAmount.toString() : "",
          loanPurpose: app.loanPurpose || "",
          loanTermMonths: app.loanTermMonths > 0 ? app.loanTermMonths.toString() : "",
        });
      }
      setIsFetching(false);
    }
    fetchApplication();
  }, [params.id]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));

    const numericValue =
      field === "loanAmount" || field === "loanTermMonths"
        ? parseFloat(value) || 0
        : value;

    triggerAutosave({
      step3: {
        ...formData,
        [field]: numericValue,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formDataObj = new FormData();
    formDataObj.append("loanAmount", formData.loanAmount);
    formDataObj.append("loanPurpose", formData.loanPurpose);
    formDataObj.append("loanTermMonths", formData.loanTermMonths);

    const result = await saveStep3Data(params.id, formDataObj);

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      router.push(`/applications/${params.id}/edit/step-4`);
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message || "Failed to save loan details",
      });
      setIsLoading(false);
    }
  };

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(formData.loanAmount) || 0;
    const months = parseInt(formData.loanTermMonths, 10) || 0;
    const rate = calculateInterestRate(months);

    if (principal > 0 && months > 0) {
      const monthlyRate = rate / 100 / 12;
      const payment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
      return payment;
    }
    return 0;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalPayment =
    monthlyPayment * (parseInt(formData.loanTermMonths, 10) || 0);
  const interestAmount = totalPayment - (parseFloat(formData.loanAmount) || 0);

  if (isFetching) {
    return (
      <WizardStepCard
        title="Loan Details"
        description="Specify the loan amount, purpose, and preferred term"
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
        title="Loan Details"
        description="Specify the loan amount, purpose, and preferred term"
      >
        <div className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Please correct the errors below and try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="loanAmount">
              Loan Amount (₱) <span className="text-red-600">*</span>
            </Label>
            <Input
              id="loanAmount"
              name="loanAmount"
              type="number"
              min="10000"
              max="5000000"
              step="1000"
              value={formData.loanAmount}
              onChange={(e) => handleFieldChange("loanAmount", e.target.value)}
              placeholder="100000"
              disabled={isLoading}
              className={errors.loanAmount ? "border-red-500" : ""}
            />
            {errors.loanAmount && (
              <p className="text-sm text-red-600">{errors.loanAmount}</p>
            )}
            <p className="text-xs text-gray-500">
              Minimum: ₱10,000 | Maximum: ₱5,000,000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTermMonths">
              Loan Term <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.loanTermMonths}
              onValueChange={(value) => handleFieldChange("loanTermMonths", value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.loanTermMonths ? "border-red-500" : ""}>
                <SelectValue placeholder="Select loan term" />
              </SelectTrigger>
              <SelectContent>
                {LOAN_TERM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.loanTermMonths && (
              <p className="text-sm text-red-600">{errors.loanTermMonths}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanPurpose">
              Loan Purpose <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="loanPurpose"
              name="loanPurpose"
              value={formData.loanPurpose}
              onChange={(e) => handleFieldChange("loanPurpose", e.target.value)}
              placeholder="Please describe how you plan to use the loan..."
              disabled={isLoading}
              rows={4}
              className={errors.loanPurpose ? "border-red-500" : ""}
            />
            {errors.loanPurpose && (
              <p className="text-sm text-red-600">{errors.loanPurpose}</p>
            )}
            <p className="text-xs text-gray-500">
              Minimum 20 characters. Be specific about your intended use of the loan.
            </p>
          </div>

          {formData.loanAmount && formData.loanTermMonths && (
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="mb-4 font-semibold text-gray-900">
                  Loan Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Principal Amount:</span>
                    <span className="font-medium">
                      ₱{parseFloat(formData.loanAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-medium">
                      {calculateInterestRate(parseInt(formData.loanTermMonths))}% per annum
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Term:</span>
                    <span className="font-medium">
                      {formData.loanTermMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Monthly Payment:</span>
                    <span className="font-semibold text-blue-600">
                      ₱{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest:</span>
                    <span className="font-medium">
                      ₱{interestAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-gray-900">Total Payment:</span>
                    <span className="font-semibold text-gray-900">
                      ₱{totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <AutosaveIndicator status={status} />
        </div>
      </WizardStepCard>

      <WizardNavigation
        currentStep={3}
        applicationId={params.id}
        isLoading={isLoading}
      />
    </form>
  );
}
