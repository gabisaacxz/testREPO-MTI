"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
  Upload,
  X,
  Lock,
  Users,
  UserPlus,
  Clock,
  Hash
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Logic & Schema Imports
import {
  getAttendanceStatus,
  performAttendanceAction,
  getSites
} from "@/app/attendance/actions/attendance";
import {
  attendanceFormSchema,
  AttendanceFormValues,
  WorkCategory,
  DEPARTMENTS
} from "@/lib/validations/attendance";

// Camera Component Import
import { CameraView } from "./camera-view";

const JOB_ROLES = ["Rigger", "Installer", "Driver"];

export function AttendanceForm() {
  const [status, setStatus] = useState<"no-entry" | "Timed-in" | "completed">("no-entry");
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [dbLogs, setDbLogs] = useState<{ timeIn?: string; timeOut?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- TEAM MEMBER STATES ---
  const [memberInput, setMemberInput] = useState("");
  const [memberRole, setMemberRole] = useState("Rigger");
  const [memberList, setMemberList] = useState<{ name: string; role: string }[]>([]);

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

  const { watch, setValue, resetField } = form;
  const workCategory = watch("workCategory");
  const currentUserEmail = watch("userId");

  // Load Sites
  useEffect(() => {
    async function loadSites() {
      const data = await getSites();
      setSites(data);
    }
    loadSites();
  }, []);

  // Sync Status, Logs, & Team Members
  useEffect(() => {
    async function checkStatus() {
      if (currentUserEmail?.includes("@") && currentUserEmail?.length > 5) {
        try {
          const data = await getAttendanceStatus(currentUserEmail);
          if (!data) {
            setStatus("no-entry");
            setMemberList([]);
            setDbLogs(null);
          } else {
            setDbLogs({
              timeIn: data.timeIn?.toISOString() || undefined,
              timeOut: data.timeOut?.toISOString() || undefined
            });

            if (data.timeOut) {
              setStatus("completed");
            } else {
              setStatus("Timed-in");
              if (data.activities) setValue("activities", data.activities);
              if (data.members) setMemberList(data.members as any);
              if (data.siteId) setValue("siteId", data.siteId);
              if (data.department) setValue("department", data.department);
              
              // MANDATORY: Clear photo on status sync to force new photo for Time-Out
              setCapturedPhoto(null);
            }
          }
        } catch (err) {
          console.error("Status check failed");
        }
      }
    }
    checkStatus();
  }, [currentUserEmail, setValue]);

  const addMember = () => {
    const name = memberInput.trim();
    if (name) {
      if (memberList.some(m => m.name.toLowerCase() === name.toLowerCase())) {
        toast.error("Member already added.");
        return;
      }
      setMemberList([...memberList, { name, role: memberRole }]);
      setMemberInput("");
    }
  };

  const removeMember = (index: number) => {
    setMemberList(memberList.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCapturedPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (category: WorkCategory) => {
    setValue("workCategory", category);
    category === WorkCategory.HEAD_OFFICE ? resetField("siteId") : resetField("department");
  };

  const onAction = async (data: AttendanceFormValues) => {
    if (!capturedPhoto) {
      toast.error(`Photo verification is required for ${status === "no-entry" ? "Time In" : "Time Out"}!`);
      return;
    }

    setLoading(true);
    try {
      const locationValue = data.workCategory === WorkCategory.HEAD_OFFICE ? data.department : data.siteId;

      await performAttendanceAction(
        data.userId,
        status === "no-entry" ? "time_in" : "time_out",
        locationValue!,
        data.workCategory as any,
        data.activities,
        { photo: capturedPhoto },
        memberList
      );

      setCapturedPhoto(null);
      toast.success(status === "no-entry" ? "Clocked in successfully" : "Clocked out successfully");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date?: string) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto border-t-[6px] border-[#C62828] rounded-none shadow-2xl bg-white">
        <CardHeader className="pb-2 space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-black uppercase tracking-tighter text-slate-800">Attendance Portal</CardTitle>
            <Badge variant="outline" className={`uppercase text-[10px] font-bold ${status === 'completed' ? 'border-green-600 text-green-600' : 'border-[#C62828] text-[#C62828]'}`}>
              {status.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase tracking-[0.2em]">Martindale Technologies Inc.</p>
        </CardHeader>

        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAction)} className="space-y-6">
              
              {/* Work Nature Toggle - Now enabled during Timed-in state */}
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Work Nature</p>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-lg">
                  <button type="button" onClick={() => handleCategoryChange(WorkCategory.HEAD_OFFICE)} disabled={status === "completed"}
                    className={`flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase rounded-md transition-all ${workCategory === WorkCategory.HEAD_OFFICE ? "bg-white shadow-sm text-[#C62828]" : "text-slate-400 disabled:opacity-50"}`}>
                    <Building2 size={14} /> Office
                  </button>
                  <button type="button" onClick={() => handleCategoryChange(WorkCategory.FIELD)} disabled={status === "completed"}
                    className={`flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase rounded-md transition-all ${workCategory === WorkCategory.FIELD ? "bg-white shadow-sm text-[#C62828]" : "text-slate-400 disabled:opacity-50"}`}>
                    <HardHat size={14} /> Field
                  </button>
                </div>
              </div>

              {/* Email Field - Enabled during Timed-in */}
              <FormField control={form.control} name="userId" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600">
                    <Mail size={14} className="text-[#C62828]" /> Company Email
                  </FormLabel>
                  <FormControl><Input {...field} disabled={status === "completed"} placeholder="employee@mti.com.ph" className="bg-slate-50 border-slate-200" /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              {/* Team Members Section */}
              <div className="space-y-3 p-3 border border-slate-100 bg-slate-50/50 rounded-lg">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Users size={14} className="text-[#C62828]" /> Team Composition
                </p>
                <div className="flex gap-2">
                  <Input disabled={status === "completed"} className="bg-white text-xs h-9" placeholder="Name" value={memberInput} onChange={(e) => setMemberInput(e.target.value)} />
                  <select disabled={status === "completed"} className="text-[10px] font-bold uppercase border rounded-md px-2 bg-white outline-none" value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                    {JOB_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <Button type="button" onClick={addMember} disabled={status === "completed"} variant="secondary" className="h-9 px-3"><UserPlus size={16}/></Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {memberList.map((m, i) => (
                    <Badge key={i} variant="secondary" className="bg-white border-slate-200 text-slate-700 rounded-none text-[9px] font-bold py-1">
                      {m.name} ({m.role})
                      {status !== "completed" && <X size={10} className="ml-2 cursor-pointer text-red-500" onClick={() => removeMember(i)}/>}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location Selector - Enabled during Timed-in */}
              <FormField control={form.control} name={workCategory === WorkCategory.HEAD_OFFICE ? "department" : "siteId"} render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600">
                    {workCategory === WorkCategory.HEAD_OFFICE ? <Building2 size={14} /> : <MapPin size={14} />}
                    {workCategory === WorkCategory.HEAD_OFFICE ? "Department" : "Project Site"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={status === "completed"}>
                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Select location..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {workCategory === WorkCategory.HEAD_OFFICE
                        ? DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)
                        : sites.map(s => <SelectItem key={s.id} value={s.id}>{s.siteIdCode ? `[${s.siteIdCode}] ` : ""}{s.siteName}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              {/* Photo Capture Section - Required for both Time In and Out */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Camera size={14} className="text-[#C62828]" /> Identity Check
                </p>
                {capturedPhoto ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-slate-200">
                    <img src={capturedPhoto} alt="Verification" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCapturedPhoto(null)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      disabled={status === "completed"}
                      className="py-6 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center gap-1 hover:bg-slate-50 transition-all opacity-70"
                    >
                      <Camera size={20} className="text-slate-400" />
                      <span className="text-[9px] font-bold uppercase text-slate-400">Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={status === "completed"}
                      className="py-6 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center gap-1 hover:bg-slate-50 transition-all opacity-70"
                    >
                      <Upload size={20} className="text-slate-400" />
                      <span className="text-[9px] font-bold uppercase text-slate-400">Upload Pic</span>
                    </button>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
              </div>

              {/* Activity Log */}
              <FormField control={form.control} name="activities" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600"><MessageSquare size={14} /> Accomplishment Report</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea {...field} disabled={status === "no-entry" || status === "completed"} placeholder="Detailed activities..." className="bg-slate-50 border-slate-200 text-xs min-h-[80px]" />
                      {(status === "no-entry" || status === "completed") && <Lock size={12} className="absolute top-3 right-3 text-slate-300" />}
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              {/* Time Logs Display */}
              <div className="grid grid-cols-2 divide-x border-y border-slate-100 py-4 bg-slate-50/30">
                 <div className="text-center">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Clock size={10}/> Time In</p>
                   <p className="text-sm font-black text-slate-800">{formatTime(dbLogs?.timeIn)}</p>
                 </div>
                 <div className="text-center">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Clock size={10}/> Time Out</p>
                   <p className="text-sm font-black text-slate-800">{formatTime(dbLogs?.timeOut)}</p>
                 </div>
              </div>

              <Button type="submit" disabled={loading || status === "completed"} className="w-full bg-[#C62828] hover:bg-[#a31f1f] text-white font-black uppercase tracking-[0.2em] py-7 rounded-none transition-all shadow-xl active:scale-95">
                {loading ? <Loader2 className="animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    {status === "no-entry" ? <LogIn size={18} /> : <LogOut size={18} />}
                    {status === "no-entry" ? "Confirm Time In" : "Confirm Time Out"}
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isCameraOpen && (
        <CameraView
          onCapture={(base64) => {
            setCapturedPhoto(base64);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </>
  );
}