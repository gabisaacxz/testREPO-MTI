"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEPARTMENTS } from "@/lib/validations/attendance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Mail, 
  Loader2, 
  Building2, 
  HardHat, 
  MessageSquare,
  LogIn,
  LogOut,
  Camera,
  X,
  Lock
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
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: { 
      userId: "", 
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

  useEffect(() => {
    async function loadSites() {
      const data = await getSites();
      setSites(data);
    }
    loadSites();
  }, []);

  useEffect(() => {
    async function checkStatus() {
      if (currentUserEmail?.includes("@") && currentUserEmail?.length > 5) {
        const data = await getAttendanceStatus(currentUserEmail);
        if (!data) setStatus("no-entry");
        else if (data.timeOut) setStatus("completed");
        else {
          setStatus("checked-in");
          if (data.activities) setValue("activities", data.activities);
        }
      }
    }
    checkStatus();
  }, [currentUserEmail, setValue]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Added 10MB check here to match your other page
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Max 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (category: WorkCategory) => {
    setValue("workCategory", category);
    if (category === WorkCategory.HEAD_OFFICE) {
      resetField("siteId");
    } else {
      resetField("department");
    }
  };

  const onAction = async (data: AttendanceFormValues) => {
    if (!capturedPhoto) {
      toast.error("Photo verification is required!");
      return;
    }

    setLoading(true);
    try {
      const locationValue = data.workCategory === WorkCategory.HEAD_OFFICE 
        ? data.department 
        : data.siteId;

      if (!locationValue) {
        toast.error(`Please select a ${data.workCategory === WorkCategory.HEAD_OFFICE ? 'Department' : 'Site'}`);
        return;
      }
      
      // FIXED: Wrapped capturedPhoto in an object { photo: capturedPhoto }
      // This matches the performAttendanceAction signature in actions/attendance.ts
      await performAttendanceAction(
        data.userId,
        status === "no-entry" ? "time_in" : "time_out", 
        locationValue,
        data.workCategory as any,
        data.activities,
        { photo: capturedPhoto } 
      );

      if (status === "no-entry") setStatus("checked-in");
      else setStatus("completed");

      setCapturedPhoto(null); 
      toast.success("Attendance verified and logged.");
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
            className={`uppercase text-[10px] font-bold ${status === 'completed' ? 'border-green-600 text-green-600' : 'border-[#C62828] text-[#C62828]'}`}
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
                    : "text-slate-400 hover:text-slate-600 disabled:opacity-50"
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
                    : "text-slate-400 hover:text-slate-600 disabled:opacity-50"
                }`}
              >
                <HardHat size={16} /> Field
              </button>
            </div>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Camera size={14} className="text-[#C62828]" /> Verification Photo
            </Label>
            
            {capturedPhoto ? (
              <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden border-2 border-slate-800">
                <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setCapturedPhoto(null)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={status === "completed"}
                className="w-full py-8 bg-white border border-slate-200 rounded-md flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <Camera size={24} className="text-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tap to Capture</span>
              </button>
            )}
            <input 
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handlePhotoCapture}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600">
                <Mail size={14} className="text-[#C62828]" /> Company Email
              </Label>
              <input 
                {...register("userId")} 
                disabled={status !== "no-entry"}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#C62828] outline-none transition-all disabled:opacity-70" 
                placeholder="employee@mti.com.ph"
              />
              {errors.userId && <p className="text-[10px] text-red-500 font-bold">{errors.userId.message}</p>}
            </div>

            <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600">
                {workCategory === WorkCategory.HEAD_OFFICE ? <Building2 size={14} /> : <MapPin size={14} />}
                {workCategory === WorkCategory.HEAD_OFFICE ? "Department" : "Project Site"}
              </Label>
              
              {workCategory === WorkCategory.HEAD_OFFICE ? (
                <select {...register("department")} disabled={status !== "no-entry"} className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-70">
                  <option value="">Select Dept...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <select {...register("siteId")} disabled={status !== "no-entry"} className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-70">
                  <option value="">Select Site...</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.siteName}</option>)}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600">
                <MessageSquare size={14} /> Activity Log
              </Label>
              <div className="relative">
                <textarea 
                  {...register("activities")} 
                  disabled={status === "no-entry" || status === "completed"}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm min-h-[80px] outline-none resize-none disabled:bg-slate-100" 
                  placeholder={status === "no-entry" ? "Time in to write log..." : "What are you working on?"}
                />
                {(status === "no-entry" || status === "completed") && (
                  <Lock size={12} className="absolute top-3 right-3 text-slate-300" />
                )}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || status === "completed"} 
            className="w-full bg-[#C62828] hover:bg-[#a31f1f] text-white font-black uppercase tracking-[0.2em] py-8 rounded-xl disabled:bg-slate-300"
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