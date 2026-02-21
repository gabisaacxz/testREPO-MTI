"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { WorkCategory } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Uploads a base64 image to Supabase Storage
 */
async function uploadAttendanceImage(base64Data: string, email: string, action: string) {
  try {
    const base64Str = base64Data.split(",")[1];
    const buffer = Buffer.from(base64Str, "base64");
    
    const cleanEmail = email.replace(/[@.]/g, "_");
    const fileName = `${action}_${cleanEmail}_${Date.now()}.jpg`;
    const filePath = `evidence/${fileName}`;

    const { error } = await supabase.storage
      .from("attendance-evidence")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("attendance-evidence")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Storage Error:", error);
    throw new Error("Failed to upload verification photo.");
  }
}

/**
 * Fetches sites directly from the DB. 
 * If the DB is empty, it returns an empty array.
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
    return []; // Return empty so the UI can handle the "No sites found" state
  }
}

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
 * Handles the full time-In/time-Out flow.
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

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) throw new Error("User not found.");
  
  const imageData = imagePayload?.photo; 
  if (!imageData) throw new Error("Photo is required.");

  const userId = user.id;
  const publicImageUrl = await uploadAttendanceImage(imageData, email, action);

  if (action === 'time_in') {
    const existing = await prisma.attendanceLog.findUnique({
      where: { userId_attendanceDate: { userId, attendanceDate: today } },
    });

    if (existing) throw new Error("Already timed in for today.");

    let finalSiteId: string | null = null;
    let finalDepartment: string | null = user.department;

    if (workCategory === "FIELD") {
      // Check if locationValue is a valid UUID
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
        userId,
        attendanceDate: today,
        timeIn: now,
        siteId: finalSiteId,    
        department: finalDepartment,
        activities: activities || null,
        imageInUrl: publicImageUrl,
        members: memberList, // Saved as JSONB array of objects
      },
    });

    revalidatePath('/attendance');
    return attendance;
  } 
  
  if (action === 'time_out') {
    const existing = await prisma.attendanceLog.findUnique({
      where: { userId_attendanceDate: { userId, attendanceDate: today } },
    });

    if (!existing) throw new Error("No active record found.");

    const attendance = await prisma.attendanceLog.update({
      where: { id: existing.id },
      data: { 
        timeOut: now,
        activities: activities || existing.activities,
        imageOutUrl: publicImageUrl, 
      },
    });

    revalidatePath('/attendance');
    return attendance;
  }
}