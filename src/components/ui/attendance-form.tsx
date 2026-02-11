"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, LogOut, MapPin, User } from "lucide-react";
import { getAttendanceStatus, performAttendanceAction } from "@/app/attendance/actions/attendance";
import { toast } from "sonner";

// 1. Zod Schema aligned with your DB Requirements
const attendanceFormSchema = z.object({
  userId: z.string().uuid("Invalid Employee ID format (must be a UUID)"),
  siteId: z.string().uuid("Please select a valid work site"),
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

type AttendanceStatus = "no-entry" | "checked-in" | "completed";

export function AttendanceForm() {
  const [status, setStatus] = useState<AttendanceStatus>("no-entry");
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      userId: "", 
      siteId: "",
    },
  });

  const currentUserId = form.watch("userId");

  useEffect(() => {
    async function fetchStatus() {
      // Basic check: UUIDs are 36 characters long
      if (!currentUserId || currentUserId.length < 36) return; 
      try {
        const data = await getAttendanceStatus(currentUserId);
        setAttendance(data);
        if (!data) setStatus("no-entry");
        else if (data.timeIn && !data.timeOut) setStatus("checked-in");
        else if (data.timeIn && data.timeOut) setStatus("completed");
      } catch (err) {
        console.error("Status fetch error:", err);
      }
    }
    fetchStatus();
  }, [currentUserId]);

  const onAction = async (data: AttendanceFormValues) => {
    setLoading(true);
    const action = status === "no-entry" ? "check_in" : "check_out";
    
    try {
      const result = await performAttendanceAction(data.userId, action, data.siteId);
      setAttendance(result);
      
      if (action === "check_in") {
        setStatus("checked-in");
        toast.success("Timed In Successfully");
      } else {
        setStatus("completed");
        toast.success("Timed Out Successfully");
      }
    } catch (err) {
      // This will catch the "Foreign Key" error if the IDs don't exist in Supabase
      toast.error(err instanceof Error ? err.message : "Database Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-t-4 border-[var(--color-mti-navy)] rounded-none shadow-xl bg-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold uppercase tracking-tight text-[var(--color-mti-slate)]">
            Attendance Tracker
          </CardTitle>
          <Badge variant={status === "completed" ? "secondary" : "outline"} className="uppercase text-[9px]">
            {status.replace("-", " ")}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onAction)} className="space-y-5">
          
          {/* 1. EMPLOYEE ID INPUT */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Employee ID (Paste UUID from Supabase)
            </Label>
            <input
              {...form.register("userId")}
              placeholder="00000000-0000-0000-0000-000000000000"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-[var(--color-mti-navy)] outline-none transition-all"
              disabled={status !== "no-entry"}
            />
            {form.formState.errors.userId && (
              <p className="text-[10px] text-red-600 font-bold uppercase italic">{form.formState.errors.userId.message}</p>
            )}
          </div>

          {/* 2. SITE SELECTION DROPDOWN */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} /> Project Site
            </Label>
            <select
              {...form.register("siteId")}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-[var(--color-mti-navy)] outline-none cursor-pointer"
              disabled={status !== "no-entry"}
            >
              <option value="">Choose Site...</option>
              {/* NOTE: These values MUST exist in your 'sites' table in Supabase */}
              <option value="550e8400-e29b-41d4-a716-446655440000">Manila Towers - PH</option>
              <option value="6ba7b810-9dad-11d1-80b4-00c04fd430c8">Sydney 5G - AU</option>
              <option value="f47ac10b-58cc-4372-a567-0e02b2c3d479">Port Moresby Hub - PNG</option>
            </select>
            {form.formState.errors.siteId && (
              <p className="text-[10px] text-red-600 font-bold uppercase italic">{form.formState.errors.siteId.message}</p>
            )}
          </div>

          {/* 3. TIME LOGS DISPLAY */}
          {(attendance?.timeIn || attendance?.timeOut) && (
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 bg-gray-50/50 rounded-sm px-2">
              <div className="text-center">
                <p className="text-[9px] uppercase font-bold text-gray-400">Time In</p>
                <p className="text-xs font-bold text-[var(--color-mti-slate)]">
                  {attendance.timeIn ? new Date(attendance.timeIn).toLocaleTimeString() : "--:--"}
                </p>
              </div>
              <div className="text-center border-l border-gray-100">
                <p className="text-[9px] uppercase font-bold text-gray-400">Time Out</p>
                <p className="text-xs font-bold text-[var(--color-mti-slate)]">
                  {attendance.timeOut ? new Date(attendance.timeOut).toLocaleTimeString() : "--:--"}
                </p>
              </div>
            </div>
          )}

          {/* 4. THE ACTION BUTTON */}
          {status !== "completed" ? (
            <Button
              type="submit"
              disabled={loading}
              className={`w-full font-bold uppercase tracking-widest py-6 rounded-none transition-all shadow-md ${
                status === "no-entry" 
                ? "bg-[var(--color-mti-navy)] hover:bg-[var(--color-mti-blue)] text-white" 
                : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
            >
              {status === "no-entry" ? (
                <><LogIn className="mr-2 h-4 w-4" /> {loading ? "Logging..." : "Time In"}</>
              ) : (
                <><LogOut className="mr-2 h-4 w-4" /> {loading ? "Logging..." : "Time Out"}</>
              )}
            </Button>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-green-700 font-bold uppercase text-xs tracking-tighter">Shift Completed for Today</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}