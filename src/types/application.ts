import { ApplicationStatus } from "@/entities/application.entity";

export interface ApplicationDTO {
  id: string;
  applicationNumber: string;
  status: ApplicationStatus;
  borrowerName: string;
  borrowerFirstName: string;
  borrowerMiddleName?: string;
  borrowerLastName: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  borrowerAddress?: string;
  regionId?: string;
  provinceId?: string;
  cityId?: string;
  loanAmount: number;
  loanPurpose?: string;
  loanTermMonths: number;
  interestRate: number;
  currentStep: number;
  stepData?: Record<string, any>;
  lastSavedAt?: Date;
  submittedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Step1Data {
  borrowerFirstName: string;
  borrowerMiddleName?: string;
  borrowerLastName: string;
  borrowerEmail: string;
  borrowerPhone: string;
}

export interface Step2Data {
  regionId: string;
  provinceId: string;
  cityId: string;
  borrowerAddress: string;
}

export interface Step3Data {
  loanAmount: number;
  loanPurpose: string;
  loanTermMonths: number;
}

export interface Step4Data {
  termsAccepted: boolean;
}

export interface WizardStepData {
  step1?: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
  step4?: Step4Data;
}

export interface AutosaveStatus {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt?: Date;
  message?: string;
}

export interface LocationOption {
  id: string;
  code: string;
  name: string;
}

export interface SaveStepResult {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
  applicationId?: string;
  currentStep?: number;
}

export interface SubmitApplicationResult {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
  applicationId?: string;
  applicationNumber?: string;
}

export const WIZARD_STEPS = [
  { step: 1, title: "Personal Information", description: "Basic borrower details" },
  { step: 2, title: "Address Information", description: "Location and contact" },
  { step: 3, title: "Loan Details", description: "Amount and terms" },
  { step: 4, title: "Review & Submit", description: "Confirm and submit" },
] as const;

export const LOAN_TERM_OPTIONS = [
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months (1 year)" },
  { value: 24, label: "24 months (2 years)" },
  { value: 36, label: "36 months (3 years)" },
  { value: 48, label: "48 months (4 years)" },
  { value: 60, label: "60 months (5 years)" },
] as const;

export function calculateInterestRate(termMonths: number): number {
  const rateMap: Record<number, number> = {
    6: 8.5,
    12: 9.0,
    24: 9.5,
    36: 10.0,
    48: 10.5,
    60: 11.0,
  };
  return rateMap[termMonths] || 9.0;
}
