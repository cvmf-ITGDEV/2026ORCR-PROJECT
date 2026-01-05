import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getDraftApplication } from "@/app/actions/application";
import { WizardStepIndicator } from "@/components/wizard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface WizardLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default async function WizardLayout({ children, params }: WizardLayoutProps) {
  const application = await getDraftApplication(params.id);

  if (!application) {
    redirect("/applications");
  }

  if (application.status !== "draft") {
    redirect(`/applications/${params.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
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
                  <h1 className="text-lg font-semibold">
                    {application.applicationNumber}
                  </h1>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                {application.lastSavedAt && (
                  <p className="text-sm text-gray-500">
                    Last saved: {new Date(application.lastSavedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <WizardStepIndicator currentStep={application.currentStep} />

        <Card className="overflow-hidden">{children}</Card>
      </div>
    </div>
  );
}
