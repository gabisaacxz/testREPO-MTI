"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, MapPin, LogIn, LogOut, CheckCircle } from "lucide-react";
import { getAttendanceStatus, performAttendanceAction } from "@/app/attendance/actions/attendance";
import { toast } from "sonner";

export default function AttendancePage() {
  const [userId, setUserId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);

  // Status derived from the attendance record
  const status = !attendance ? "no-entry" : attendance.timeOut ? "completed" : "checked-in";

  // 1. Fetch attendance status when userId changes
  useEffect(() => {
    async function fetchStatus() {
      if (userId.length < 36) return; // Only fetch if it looks like a full UUID
      try {
        const data = await getAttendanceStatus(userId);
        setAttendance(data);
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    }
    fetchStatus();
  }, [userId]);

  // 2. Handle the Time In / Time Out click
  const handleAction = async () => {
    if (!userId || !siteId) {
      toast.error("Please provide both Employee ID and Site");
      return;
    }

    setLoading(true);
    try {
      const action = status === "no-entry" ? "check_in" : "check_out";
      const data = await performAttendanceAction(userId, action, siteId);
      setAttendance(data);
      toast.success(action === "check_in" ? "Clocked In Successfully" : "Clocked Out Successfully");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: string | null) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-2xl shadow-2xl border-t-4 border-t-[var(--color-mti-navy)] rounded-none">
        <CardHeader className="px-8 pt-10 pb-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold uppercase text-[var(--color-mti-slate)]">Attendance Tracker</CardTitle>
            <Badge className={`${
              status === 'completed' ? 'bg-green-600' : 'bg-[var(--color-mti-navy)]'
            } text-white px-4 py-1 uppercase tracking-widest`}>
              {status === "no-entry" ? "Absent" : status === "checked-in" ? "Active" : "Completed"}
            </Badge>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Field Operations Management</p>
        </CardHeader>
        
        <CardContent className="px-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2 tracking-widest">
                <User size={14}/> Employee UUID
              </Label>
              <input 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-sm focus:border-[var(--color-mti-navy)] outline-none transition-all font-mono"
                placeholder="Paste User ID from Supabase"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={status === "completed"}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2 tracking-widest">
                <MapPin size={14}/> Project Site
              </Label>
              <select 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-sm outline-none cursor-pointer"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                disabled={status !== "no-entry"}
              >
                <option value="">Select Working Location...</option>
                {/* Replace the value below with your actual Site UUID from Supabase */}
                <option value="0b19cbac-eb24-4987-a49f-68f801a06f71">LAS ALABANG</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-8 border-y border-gray-100 bg-gray-50/30">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clock In</p>
              <p className="text-2xl font-black">{formatTime(attendance?.timeIn)}</p>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clock Out</p>
              <p className="text-2xl font-black">{formatTime(attendance?.timeOut)}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-8">
          {status !== "completed" ? (
            <Button 
              onClick={handleAction}
              disabled={loading || !userId || !siteId}
              className={`w-full py-8 text-lg font-bold uppercase tracking-widest rounded-none transition-all ${
                status === "no-entry" 
                ? "bg-[var(--color-mti-navy)] hover:bg-red-700" 
                : "bg-orange-600 hover:bg-orange-700"
              } text-white`}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  {status === "no-entry" ? <LogIn className="mr-3" /> : <LogOut className="mr-3" />}
                  {status === "no-entry" ? "Confirm Time In" : "Confirm Time Out"}
                </>
              )}
            </Button>
          ) : (
            <div className="w-full py-6 bg-green-50 text-green-700 flex items-center justify-center gap-3 font-bold uppercase tracking-widest border border-green-100">
              <CheckCircle size={20} />
              Shift Logged
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}