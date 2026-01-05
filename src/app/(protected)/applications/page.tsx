import Link from "next/link";
import { getMyApplications, getMyDrafts, createDraftApplication } from "@/app/actions/application";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { ApplicationStatus } from "@/entities/application.entity";
import { WIZARD_STEPS } from "@/types/application";

export const dynamic = "force-dynamic";

async function handleNewApplication() {
  "use server";
  const result = await createDraftApplication();
  return result;
}

function getStatusBadge(status: ApplicationStatus) {
  const statusConfig: Record<ApplicationStatus, { variant: any; label: string; icon: any }> = {
    draft: { variant: "secondary", label: "Draft", icon: FileText },
    submitted: { variant: "default", label: "Submitted", icon: Clock },
    under_review: { variant: "default", label: "Under Review", icon: Clock },
    approved: { variant: "default", label: "Approved", icon: CheckCircle },
    rejected: { variant: "destructive", label: "Rejected", icon: XCircle },
    disbursed: { variant: "default", label: "Disbursed", icon: CheckCircle },
    closed: { variant: "secondary", label: "Closed", icon: FileText },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function getCurrentStepLabel(step: number) {
  const stepInfo = WIZARD_STEPS.find((s) => s.step === step);
  return stepInfo ? stepInfo.title : `Step ${step}`;
}

export default async function ApplicationsPage() {
  const drafts = await getMyDrafts();
  const applications = await getMyApplications();

  const submittedApplications = applications.filter((app) => app.status !== "draft");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
          <p className="text-gray-600">Manage your loan applications</p>
        </div>
        <form
          action={async () => {
            "use server";
            const result = await handleNewApplication();
            const { redirect } = await import("next/navigation");
            redirect(`/applications/${result.id}/edit/step-1`);
          }}
        >
          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </form>
      </div>

      {drafts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Draft Applications
            </CardTitle>
            <CardDescription>
              You have {drafts.length} incomplete application{drafts.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {drafts.map((draft) => (
              <Card key={draft.id} className="bg-white">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{draft.applicationNumber}</h3>
                      <Badge variant="secondary">Draft</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Current step: {getCurrentStepLabel(draft.currentStep)}
                    </p>
                    {draft.lastSavedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last saved: {new Date(draft.lastSavedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/applications/${draft.id}/edit`}>
                      <Button>Continue</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            {submittedApplications.length > 0
              ? `${submittedApplications.length} application${submittedApplications.length > 1 ? "s" : ""}`
              : "No applications yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submittedApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No applications</h3>
              <p className="mt-2 text-sm text-gray-600">
                You haven&apos;t submitted any applications yet.
              </p>
              <div className="mt-6">
                <form
                  action={async () => {
                    "use server";
                    const result = await handleNewApplication();
                    const { redirect } = await import("next/navigation");
                    redirect(`/applications/${result.id}/edit/step-1`);
                  }}
                >
                  <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Application
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {submittedApplications.map((application, index) => (
                <div key={application.id}>
                  {index > 0 && <Separator />}
                  <Link href={`/applications/${application.id}`}>
                    <div className="flex items-center justify-between py-4 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {application.applicationNumber}
                          </h3>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Borrower:</span>{" "}
                            {application.borrowerName}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span>{" "}
                            ₱{application.loanAmount.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Term:</span>{" "}
                            {application.loanTermMonths} months
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>{" "}
                            {application.submittedAt
                              ? new Date(application.submittedAt).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
