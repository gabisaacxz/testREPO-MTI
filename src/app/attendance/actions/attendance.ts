"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { WorkCategory } from "@prisma/client";
import { uploadToSupabase } from "@/lib/storage"; // Import your new modular helper

/**
 * Fetches active sites for the selection dropdown.
 */
export async function getSites() {
  try {
    return await prisma.site.findMany({
      where: { isActive: true },
      select: { id: true, siteName: true, siteIdCode: true },
      orderBy: { siteName: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch sites:", error);
    return [];
  }
}

/**
 * Checks if the user has an existing log for today.
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
 * Handles the Business Logic for Time-In and Time-Out.
 * delegates Image Storage to lib/storage.ts
 */
export async function performAttendanceAction(
  email: string,
  action: 'time_in' | 'time_out',
  locationValue: string,
  workCategory: WorkCategory,
  activities?: string,
  imagePayload?: { photo: string },
  memberList: { name: string; role: string }[] = []
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();

  // 1. User Validation
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) throw new Error("User not found.");
  if (!imagePayload?.photo) throw new Error("Photo is required.");

  // 2. Delegate Image Upload (SRP: This file doesn't care about Supabase internals)
  const cleanEmail = email.replace(/[@.]/g, "_");
  const filePath = `evidence/${action}_${cleanEmail}_${Date.now()}.jpg`;
  
  const publicImageUrl = await uploadToSupabase(
    imagePayload.photo, 
    "attendance-evidence", 
    filePath
  );

  // 3. Process Business Logic
  if (action === 'time_in') {
    const existing = await prisma.attendanceLog.findUnique({
      where: { userId_attendanceDate: { userId: user.id, attendanceDate: today } },
    });
    if (existing) throw new Error("Already timed in for today.");

    let finalSiteId: string | null = null;
    let finalDepartment: string | null = user.department;

    if (workCategory === "FIELD") {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(locationValue);
      const site = await prisma.site.findFirst({
        where: {
          OR: [
            ...(isUuid ? [{ id: locationValue }] : []),
            { siteIdCode: { equals: locationValue, mode: 'insensitive' } }
          ]
        }
      });
      
      if (site) {
        finalSiteId = site.id;
        finalDepartment = "FIELD WORK"; 
      } else {
        finalDepartment = locationValue;
      }
    }

    const attendance = await prisma.attendanceLog.create({
      data: {
        userId: user.id,
        attendanceDate: today,
        timeIn: now,
        siteId: finalSiteId,
        department: finalDepartment,
        activities: activities || null,
        imageInUrl: publicImageUrl,
        members: memberList,
      },
    });

    revalidatePath('/attendance');
    return attendance;
  } 

  if (action === 'time_out') {
    const existing = await prisma.attendanceLog.findUnique({
      where: { userId_attendanceDate: { userId: user.id, attendanceDate: today } },
    });
    if (!existing) throw new Error("No active record found.");

    const attendance = await prisma.attendanceLog.update({
      where: { id: existing.id },
      data: { 
        timeOut: now,
        activities: activities || existing.activities,
        imageOutUrl: publicImageUrl, 
        members: memberList,
      },
    });

    revalidatePath('/attendance');
    return attendance;
  }
}