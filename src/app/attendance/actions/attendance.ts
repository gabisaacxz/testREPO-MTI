"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAttendanceStatus(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  const attendance = await prisma.attendanceLog.findUnique({
    where: {
      userId_attendanceDate: {
        userId,
        attendanceDate: today,
      },
    },
  });

  return attendance || null;
}

export async function performAttendanceAction(userId: string, action: 'check_in' | 'check_out', siteId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day
  const now = new Date();

  if (action === 'check_in') {
    const existing = await prisma.attendanceLog.findUnique({
      where: {
        userId_attendanceDate: {
          userId,
          attendanceDate: today,
        },
      },
    });

    if (existing) {
      throw new Error("Already checked in today");
    }

    const attendance = await prisma.attendanceLog.create({
      data: {
        userId,
        siteId,
        attendanceDate: today,
        timeIn: now,
      },
    });

    revalidatePath('/attendance');
    return attendance;
  } else if (action === 'check_out') {
    const existing = await prisma.attendanceLog.findUnique({
      where: {
        userId_attendanceDate: {
          userId,
          attendanceDate: today,
        },
      },
    });

    if (!existing || !existing.timeIn) {
      throw new Error("Must check in first");
    }
    if (existing.timeOut) {
      throw new Error("Already checked out today");
    }

    const attendance = await prisma.attendanceLog.update({
      where: {
        userId_attendanceDate: {
          userId,
          attendanceDate: today,
        },
      },
      data: {
        timeOut: now,
      },
    });

    revalidatePath('/attendance');
    return attendance;
  }
}
