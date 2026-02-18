"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEPARTMENTS } from "@/lib/validations/attendance"; // Verified import
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Mail, // Changed icon to Mail
  Loader2, 
  Building2, 
  HardHat, 
  MessageSquare,
  CheckCircle2,
  LogIn,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { 
  getAttendanceStatus, 
  performAttendanceAction, 
  getSites 
} from "@/app/attendance/actions/attendance";
import { 
  attendanceFormSchema, 
  AttendanceFormValues, 
  WorkCategory, 
} from "@/lib/validations/attendance";

export function AttendanceForm() {
  const [status, setStatus] = useState<"no-entry" | "checked-in" | "completed">("no-entry");
  const [sites, setSites] = useState<{ id: string; siteName: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: { 
      userId: "", // This is now validated as an Email in your schema
      siteId: "", 
      workCategory: WorkCategory.FIELD, 
      activities: "",
      department: "",
      attendanceDate: new Date().toISOString().split('T')[0] 
    },
  });

  const { watch, setValue, register, resetField, formState: { errors } } = form;
  const workCategory = watch("workCategory");
  const currentUserEmail = watch("userId");

  // Load sites on mount
  useEffect(() => {
    async function loadSites() {
      const data = await getSites();
      setSites(data);
    }
    loadSites();
  }, []);

  // Fetch status whenever the email field reaches a valid-looking length
  useEffect(() => {
    async function checkStatus() {
      if (currentUserEmail?.includes("@") && currentUserEmail?.length > 5) {
        const data = await getAttendanceStatus(currentUserEmail);
        if (!data) setStatus("no-entry");
        else if (data.timeOut) setStatus("completed");
        else setStatus("checked-in");
      }
    }
    checkStatus();
  }, [currentUserEmail]);

  const handleCategoryChange = (category: WorkCategory) => {
    setValue("workCategory", category);
    if (category === WorkCategory.HEAD_OFFICE) {
      resetField("siteId");
    } else {
      resetField("department");
    }
  };

  const onAction = async (data: AttendanceFormValues) => {
    setLoading(true);
    try {
      // Determine the location value based on category
      const locationValue = data.workCategory === WorkCategory.HEAD_OFFICE 
        ? data.department 
        : data.siteId;

      if (!locationValue) {
        toast.error(`Please select a ${data.workCategory === WorkCategory.HEAD_OFFICE ? 'Department' : 'Site'}`);
        return;
      }
      
      const res = await performAttendanceAction(
        data.userId, // The Email
        status === "no-entry" ? "check_in" : "check_out", 
        locationValue
      );

      // Update local status after success
      if (status === "no-entry") setStatus("checked-in");
      else setStatus("completed");

      toast.success(`${data.workCategory === WorkCategory.HEAD_OFFICE ? "Office" : "Field"} Log Updated`);
    } catch (err: any) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-t-[6px] border-[#C62828] rounded-none shadow-2xl bg-white">
      <CardHeader className="pb-2 space-y-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-black uppercase tracking-tighter text-slate-800">
            Attendance Portal
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`uppercase text-[10px] font-bold animate-pulse ${status === 'completed' ? 'border-green-600 text-green-600' : 'border-[#C62828] text-[#C62828]'}`}
          >
            {status.replace('-', ' ')}
          </Badge>
        </div>
        <p className="text-[10px] text-slate-400 font-medium tracking-wider">Martindale Technologies Inc.</p>
      </CardHeader>
      
      <CardContent className="pt-4">
        <form onSubmit={form.handleSubmit(onAction)} className="space-y-6">
          
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Work Nature</Label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleCategoryChange(WorkCategory.HEAD_OFFICE)}
                disabled={status !== "no-entry"}
                className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${
                  workCategory === WorkCategory.HEAD_OFFICE 
                    ? "bg-white shadow-md text-[#C62828]" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Building2 size={16} /> Office
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange(WorkCategory.FIELD)}
                disabled={status !== "no-entry"}
                className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${
                  workCategory === WorkCategory.FIELD 
                    ? "bg-white shadow-md text-[#C62828]" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <HardHat size={16} /> Field
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600">
                <Mail size={14} className="text-[#C62828]" /> Company Email
              </Label>
              <input 
                {...register("userId")} 
                disabled={status === "completed"}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#C62828] outline-none transition-all" 
                placeholder="employee@mti.com.ph"
              />
              {errors.userId && <p className="text-[10px] text-red-500 font-bold">{errors.userId.message}</p>}
            </div>

            {/* Dynamic Dropdown */}
            <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600">
                {workCategory === WorkCategory.HEAD_OFFICE ? <Building2 size={14} /> : <MapPin size={14} />}
                {workCategory === WorkCategory.HEAD_OFFICE ? "Department" : "Project Site"}
              </Label>
              
              {workCategory === WorkCategory.HEAD_OFFICE ? (
                <select {...register("department")} disabled={status !== "no-entry"} className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm">
                  <option value="">Select Dept...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <select {...register("siteId")} disabled={status !== "no-entry"} className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm">
                  <option value="">Select Site...</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.siteName}</option>)}
                </select>
              )}
            </div>

            {/* Activities */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600">
                <MessageSquare size={14} /> Activity Log
              </Label>
              <textarea 
                {...register("activities")} 
                disabled={status === "completed"}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm min-h-[80px] outline-none resize-none" 
                placeholder="What are you working on today?"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || status === "completed"} 
            className="w-full bg-[#C62828] hover:bg-[#a31f1f] text-white font-black uppercase tracking-[0.2em] py-8 rounded-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <span className="flex items-center gap-2">
                {status === "no-entry" ? <LogIn size={18} /> : <LogOut size={18} />}
                {status === "no-entry" ? "Confirm Time In" : "Confirm Time Out"}
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}