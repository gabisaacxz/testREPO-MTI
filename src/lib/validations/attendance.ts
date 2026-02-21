import { z } from "zod";

export enum WorkCategory {
  HEAD_OFFICE = "HEAD_OFFICE", // Changed from "HQ" 
  FIELD = "FIELD"
}

export const DEPARTMENTS = [
  "Finance and admin",
  "Human Resource",
  "Logistics",
  "Operations",
  "Sales and SAQ",
] as const;

// Added Site Constants to match your dropdown requirement
export const PROJECT_SITES = [
  { id: "MTI-MANILA-01", name: "Manila Tower Project" },
  { id: "MTI-CEBU-05", name: "Cebu Data Center" },
  { id: "MTI-DAVAO-12", name: "Davao Telecom Hub" },
] as const;

export const attendanceFormSchema = z
  .object({
    userId: z.string().email("Invalid company email address"),
    workCategory: z.nativeEnum(WorkCategory),
    siteId: z.string().optional(),
    department: z.string().optional(),
    activities: z.string().optional(),
    attendanceDate: z.string(),
  })
  // This refinement handles the "Conditional" logic of your UI
  .superRefine((data, ctx) => {
    if (data.workCategory === WorkCategory.HEAD_OFFICE && !data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Department is required for Head Office workers",
        path: ["department"],
      });
    }

    if (data.workCategory === WorkCategory.FIELD && !data.siteId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a project site",
        path: ["siteId"],
      });
    }
  });

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;