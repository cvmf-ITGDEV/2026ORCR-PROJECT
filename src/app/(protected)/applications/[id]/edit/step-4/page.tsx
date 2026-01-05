"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDraftApplication, submitApplication } from "@/app/actions/application";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardStepCard, WizardNavigation } from "@/components/wizard";
import { ApplicationDTO, calculateInterestRate } from "@/types/application";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Pencil } from "lucide-react";

interface Step4PageProps {
  params: { id: string };
}

export default function Step4Page({ params }: Step4PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState<ApplicationDTO | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchApplication() {
      setIsFetching(true);
      const app = await getDraftApplication(params.id);
      if (app) {
        setApplication(app);
      }
      setIsFetching(false);
    }
    fetchApplication();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append("termsAccepted", termsAccepted.toString());

    const result = await submitApplication(params.id, formData);

    if (result.success) {
      toast({
        title: "Application Submitted!",
        description: `Your application ${result.applicationNumber} has been submitted successfully.`,
      });
      router.push("/applications");
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message || "Failed to submit application",
      });
      setIsLoading(false);
    }
  };

  if (isFetching || !application) {
    return (
      <WizardStepCard
        title="Review & Submit"
        description="Review your application details before submitting"
      >
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </WizardStepCard>
    );
  }

  const monthlyRate = (calculateInterestRate(application.loanTermMonths) / 100) / 12;
  const monthlyPayment =
    (application.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, application.loanTermMonths)) /
    (Math.pow(1 + monthlyRate, application.loanTermMonths) - 1);
  const totalPayment = monthlyPayment * application.loanTermMonths;

  return (
    <form onSubmit={handleSubmit}>
      <WizardStepCard
        title="Review & Submit"
        description="Review your application details before submitting"
      >
        <div className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Please correct the errors below and try again.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Personal Information</CardTitle>
              <Link
                href={`/applications/${params.id}/edit/step-1`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Full Name:</span>
                <span className="font-medium">{application.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{application.borrowerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{application.borrowerPhone}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Address Information</CardTitle>
              <Link
                href={`/applications/${params.id}/edit/step-2`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600 text-xs mb-1">Complete Address:</p>
                <p className="font-medium">{application.borrowerAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Loan Details</CardTitle>
              <Link
                href={`/applications/${params.id}/edit/step-3`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-medium">
                  ₱{application.loanAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Term:</span>
                <span className="font-medium">
                  {application.loanTermMonths} months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-medium">
                  {application.interestRate}% per annum
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="font-semibold text-blue-600">
                  ₱{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Total Repayment:</span>
                <span className="font-semibold text-gray-900">
                  ₱{totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              {application.loanPurpose && (
                <>
                  <Separator />
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Loan Purpose:</p>
                    <p className="font-medium">{application.loanPurpose}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => {
                      setTermsAccepted(checked as boolean);
                      setErrors((prev) => ({ ...prev, termsAccepted: "" }));
                    }}
                    disabled={isLoading}
                    className={errors.termsAccepted ? "border-red-500" : ""}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="termsAccepted"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the terms and conditions{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <p className="text-xs text-gray-600">
                      By checking this box, I confirm that all information provided is
                      accurate and I agree to the loan terms outlined above. I understand
                      that this application will be reviewed and I may be contacted for
                      additional information.
                    </p>
                  </div>
                </div>
                {errors.termsAccepted && (
                  <p className="text-sm text-red-600">{errors.termsAccepted}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              Once you submit this application, it will be sent for review. You will not
              be able to make changes after submission. Please ensure all information is
              correct before proceeding.
            </AlertDescription>
          </Alert>
        </div>
      </WizardStepCard>

      <WizardNavigation
        currentStep={4}
        applicationId={params.id}
        isLoading={isLoading}
        showNext={true}
        nextLabel={isLoading ? "Submitting..." : "Submit Application"}
      />
    </form>
  );
}
