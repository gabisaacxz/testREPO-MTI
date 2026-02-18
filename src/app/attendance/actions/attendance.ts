"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Fetches all active sites from the database.
 */
export async function getSites() {
  try {
    return await prisma.site.findMany({
      where: { isActive: true },
      select: { id: true, siteName: true },
      orderBy: { siteName: "asc" },
    });
  } catch (error) {
    console.error("Error fetching sites:", error);
    return [];
  }
}

/**
 * Fetches status by looking up User ID via Email first.
 * This prevents the "Invalid UUID" error.
 */
export async function getAttendanceStatus(email: string) {
  if (!email || !email.includes('@')) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) return null;

  return await prisma.attendanceLog.findUnique({
    where: {
      userId_attendanceDate: {
        userId: user.id,
        attendanceDate: today,
      },
    },
  });
}

/**
 * Handles the full Check-In/Check-Out flow.
 */
export async function performAttendanceAction(
  email: string, 
  action: 'check_in' | 'check_out', 
  locationValue: string
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();

  // 1. Resolve Email to UUID
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new Error("Employee record not found. Please check your email address.");
  }

  const userId = user.id;

  // 2. CHECK IN LOGIC
  if (action === 'check_in') {
    const existing = await prisma.attendanceLog.findUnique({
      where: { userId_attendanceDate: { userId, attendanceDate: today } },
    });

    if (existing) throw new Error("Already checked in today");

    // UUID Check for locationValue (Site vs Department)
    const isSiteId = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(locationValue);

    const attendance = await prisma.attendanceLog.create({
      data: { 
        userId, 
        attendanceDate: today, 
        timeIn: now,
        siteId: isSiteId ? locationValue : null,
        department: !isSiteId ? locationValue : null,
      },
    });

    revalidatePath('/attendance');
    return attendance;
  } 
  
  // 3. CHECK OUT LOGIC
  if (action === 'check_out') {
    const existing = await prisma.attendanceLog.findUnique({
      where: { userId_attendanceDate: { userId, attendanceDate: today } },
    });

    if (!existing || !existing.timeIn) throw new Error("No active check-in record found for today.");
    if (existing.timeOut) throw new Error("You have already checked out for today.");

    const attendance = await prisma.attendanceLog.update({
      where: { id: existing.id }, // Use the internal PK for the update
      data: { timeOut: now },
    });

    revalidatePath('/attendance');
    return attendance;
  }
}