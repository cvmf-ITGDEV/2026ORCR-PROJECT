import { redirect } from "next/navigation";
import { getDraftApplication } from "@/app/actions/application";

interface EditPageProps {
  params: { id: string };
}

export default async function EditPage({ params }: EditPageProps) {
  const application = await getDraftApplication(params.id);

  if (!application) {
    redirect("/applications");
  }

  const step = application.currentStep || 1;
  redirect(`/applications/${params.id}/edit/step-${step}`);
}
