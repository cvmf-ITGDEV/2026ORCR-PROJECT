import { redirect } from "next/navigation";
import { getDraftApplication } from "@/app/actions/application";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { calculateInterestRate } from "@/types/application";

interface ApplicationDetailPageProps {
  params: { id: string };
}

function getStatusBadge(status: string) {
  const variants: Record<string, any> = {
    draft: "secondary",
    submitted: "default",
    under_review: "default",
    approved: "default",
    rejected: "destructive",
    disbursed: "default",
    closed: "secondary",
  };

  const labels: Record<string, string> = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    disbursed: "Disbursed",
    closed: "Closed",
  };

  return (
    <Badge variant={variants[status] || "default"}>
      {labels[status] || status}
    </Badge>
  );
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const application = await getDraftApplication(params.id);

  if (!application) {
    redirect("/applications");
  }

  const monthlyRate = (calculateInterestRate(application.loanTermMonths) / 100) / 12;
  const monthlyPayment =
    (application.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, application.loanTermMonths)) /
    (Math.pow(1 + monthlyRate, application.loanTermMonths) - 1);
  const totalPayment = monthlyPayment * application.loanTermMonths;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/applications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Applications
            </Button>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{application.applicationNumber}</h2>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-sm text-gray-600">
              Submitted on {application.submittedAt
                ? new Date(application.submittedAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
          <CardHeader>
            <CardTitle className="text-base">Address Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-gray-900">{application.borrowerAddress}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 text-sm">
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
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Payment:</span>
              <span className="font-semibold text-blue-600">
                ₱{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-900">Total Repayment:</span>
            <span className="font-semibold text-gray-900">
              ₱{totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>

          {application.loanPurpose && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-gray-600 font-medium mb-2">Loan Purpose:</p>
                <p className="text-gray-900">{application.loanPurpose}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {application.status === "draft" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  This application is still in draft
                </p>
                <p className="text-sm text-gray-600">
                  Complete all steps to submit your application
                </p>
              </div>
              <Link href={`/applications/${params.id}/edit`}>
                <Button>Continue Application</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
