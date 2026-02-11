import { z } from "zod";

export const attendanceSchema = z.object({
  employee_id: z.string().uuid(),
  check_in: z.date().optional(),
  check_out: z.date().optional(),
  date: z.date(),
});

export type Attendance = z.infer<typeof attendanceSchema>;
