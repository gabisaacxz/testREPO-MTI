import { z } from "zod";

/**
 * SRP: This file is responsible ONLY for defining the 
 * shape and validation rules of Attendance data.
 */

export enum WorkCategory {
  HEAD_OFFICE = "HEAD_OFFICE",
  FIELD = "FIELD"
}

export const DEPARTMENTS = [
  "Finance and admin",
  "Human Resource",
  "Logistics",
  "Operations",
  "Sales and SAQ",
  "Telecom Enterprise"
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
  /**
   * Logical Validation: Ensures that users provide the 
   * correct location based on their work nature.
   */
  .superRefine((data, ctx) => {
    // If Office: Department is mandatory
    if (data.workCategory === WorkCategory.HEAD_OFFICE && !data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Department is required for Head Office workers",
        path: ["department"],
      });
    }

    // If Field: Project Site is mandatory
    if (data.workCategory === WorkCategory.FIELD && !data.siteId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a project site",
        path: ["siteId"],
      });
    }
  });

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;