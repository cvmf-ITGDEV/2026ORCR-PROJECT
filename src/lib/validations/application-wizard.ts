import { z } from "zod";

const philippinePhoneRegex = /^(\+63|0)?9\d{9}$/;

export const step1Schema = z.object({
  borrowerFirstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s-]+$/, "First name can only contain letters, spaces, and hyphens"),
  borrowerMiddleName: z
    .string()
    .max(100, "Middle name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s-]*$/, "Middle name can only contain letters, spaces, and hyphens")
    .optional()
    .or(z.literal("")),
  borrowerLastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s-]+$/, "Last name can only contain letters, spaces, and hyphens"),
  borrowerEmail: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .toLowerCase(),
  borrowerPhone: z
    .string()
    .regex(philippinePhoneRegex, "Please enter a valid Philippine phone number (e.g., 09123456789)"),
});

export const step2Schema = z.object({
  regionId: z.string().uuid("Please select a valid region"),
  provinceId: z.string().uuid("Please select a valid province"),
  cityId: z.string().uuid("Please select a valid city/municipality"),
  borrowerAddress: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must not exceed 500 characters"),
});

export const step3Schema = z.object({
  loanAmount: z
    .number({
      required_error: "Loan amount is required",
      invalid_type_error: "Loan amount must be a number",
    })
    .min(10000, "Minimum loan amount is ₱10,000")
    .max(5000000, "Maximum loan amount is ₱5,000,000"),
  loanPurpose: z
    .string()
    .min(20, "Please provide at least 20 characters describing the loan purpose")
    .max(1000, "Loan purpose must not exceed 1000 characters"),
  loanTermMonths: z
    .number({
      required_error: "Loan term is required",
      invalid_type_error: "Loan term must be a number",
    })
    .refine((val) => [6, 12, 24, 36, 48, 60].includes(val), {
      message: "Please select a valid loan term",
    }),
});

export const step4Schema = z.object({
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must accept the terms and conditions to proceed",
    }),
});

export const completeApplicationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type Step4FormData = z.infer<typeof step4Schema>;
export type CompleteApplicationData = z.infer<typeof completeApplicationSchema>;
