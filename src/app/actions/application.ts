"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { applicationService } from "@/services/application.service";
import { getCurrentUser } from "@/lib/auth/role-guard";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "@/lib/validations/application-wizard";
import { SaveStepResult, SubmitApplicationResult, ApplicationDTO } from "@/types/application";
import { ZodError } from "zod";

export async function createDraftApplication(): Promise<{ id: string; applicationNumber: string }> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const application = await applicationService.create(user.id);
  revalidatePath("/applications");

  return {
    id: application.id,
    applicationNumber: application.applicationNumber,
  };
}

export async function getDraftApplication(applicationId: string): Promise<ApplicationDTO | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const application = await applicationService.findByIdAndUser(applicationId, user.id);
  if (!application) {
    return null;
  }

  return applicationService.toDTO(application);
}

export async function getMyDrafts(): Promise<ApplicationDTO[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const applications = await applicationService.findDraftsByUser(user.id);
  return applications.map((app) => applicationService.toDTO(app));
}

export async function getMyApplications(): Promise<ApplicationDTO[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const applications = await applicationService.findByUser(user.id);
  return applications.map((app) => applicationService.toDTO(app));
}

export async function saveStep1Data(
  applicationId: string,
  formData: FormData
): Promise<SaveStepResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const data = {
      borrowerFirstName: formData.get("borrowerFirstName") as string,
      borrowerMiddleName: (formData.get("borrowerMiddleName") as string) || "",
      borrowerLastName: formData.get("borrowerLastName") as string,
      borrowerEmail: formData.get("borrowerEmail") as string,
      borrowerPhone: formData.get("borrowerPhone") as string,
    };

    const validated = step1Schema.parse(data);

    const application = await applicationService.updateStep1(applicationId, user.id, validated);

    revalidatePath(`/applications/${applicationId}`);

    return {
      success: true,
      applicationId: application.id,
      currentStep: application.currentStep,
      message: "Personal information saved successfully",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors, message: "Validation failed" };
    }

    console.error("Error saving step 1:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save personal information",
    };
  }
}

export async function saveStep2Data(
  applicationId: string,
  formData: FormData
): Promise<SaveStepResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const data = {
      regionId: formData.get("regionId") as string,
      provinceId: formData.get("provinceId") as string,
      cityId: formData.get("cityId") as string,
      borrowerAddress: formData.get("borrowerAddress") as string,
    };

    const validated = step2Schema.parse(data);

    const application = await applicationService.updateStep2(applicationId, user.id, validated);

    revalidatePath(`/applications/${applicationId}`);

    return {
      success: true,
      applicationId: application.id,
      currentStep: application.currentStep,
      message: "Address information saved successfully",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors, message: "Validation failed" };
    }

    console.error("Error saving step 2:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save address information",
    };
  }
}

export async function saveStep3Data(
  applicationId: string,
  formData: FormData
): Promise<SaveStepResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const loanAmount = parseFloat(formData.get("loanAmount") as string);
    const loanTermMonths = parseInt(formData.get("loanTermMonths") as string, 10);

    const data = {
      loanAmount,
      loanPurpose: formData.get("loanPurpose") as string,
      loanTermMonths,
    };

    const validated = step3Schema.parse(data);

    const application = await applicationService.updateStep3(applicationId, user.id, validated);

    revalidatePath(`/applications/${applicationId}`);

    return {
      success: true,
      applicationId: application.id,
      currentStep: application.currentStep,
      message: "Loan details saved successfully",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors, message: "Validation failed" };
    }

    console.error("Error saving step 3:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save loan details",
    };
  }
}

export async function autosaveData(
  applicationId: string,
  data: Record<string, any>
): Promise<SaveStepResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    await applicationService.savePartialData(applicationId, user.id, data);

    return {
      success: true,
      message: "Data saved",
    };
  } catch (error) {
    console.error("Error autosaving data:", error);
    return {
      success: false,
      message: "Failed to autosave",
    };
  }
}

export async function submitApplication(
  applicationId: string,
  formData: FormData
): Promise<SubmitApplicationResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const termsAccepted = formData.get("termsAccepted") === "true";

    const validated = step4Schema.parse({ termsAccepted });

    if (!validated.termsAccepted) {
      return {
        success: false,
        errors: { termsAccepted: "You must accept the terms and conditions" },
        message: "Terms and conditions must be accepted",
      };
    }

    const application = await applicationService.submit(applicationId, user.id);

    revalidatePath("/applications");
    revalidatePath(`/applications/${applicationId}`);

    return {
      success: true,
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      message: "Application submitted successfully",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors, message: "Validation failed" };
    }

    console.error("Error submitting application:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit application",
    };
  }
}

export async function deleteDraftApplication(applicationId: string): Promise<SaveStepResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    await applicationService.delete(applicationId, user.id);

    revalidatePath("/applications");

    return {
      success: true,
      message: "Draft deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting draft:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete draft",
    };
  }
}

export async function redirectToApplicationEdit(applicationId: string) {
  const application = await getDraftApplication(applicationId);
  if (!application) {
    redirect("/applications");
  }

  const step = application.currentStep || 1;
  redirect(`/applications/${applicationId}/edit/step-${step}`);
}
