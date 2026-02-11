import { z } from "zod";

export const attendanceSchema = z.object({
  userId: z.string().uuid(),
  siteId: z.string().uuid(),
  timeIn: z.date().optional(),
  timeOut: z.date().optional(),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;
