"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, LogIn, LogOut, CheckCircle, Building2, HardHat, Mail, Clock, AlertCircle, Hash, ClipboardList, Lock, Camera, X, RotateCcw, Upload, Users, UserPlus } from "lucide-react";
import { getAttendanceStatus, performAttendanceAction, getSites } from "@/app/attendance/actions/attendance";
import { DEPARTMENTS, PROJECT_SITES } from "@/lib/validations/attendance";
import { toast } from "sonner";

// Simple roles for the dropdown
const JOB_ROLES = ["Rigger", "Installer", "Driver"];

export default function AttendancePage() {
  const [email, setEmail] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [siteIdInput, setSiteIdInput] = useState("");    
  const [activities, setActivities] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);
  const [activeSites, setActiveSites] = useState<any[]>([]);
  const [workCategory, setWorkCategory] = useState<"HEAD_OFFICE" | "FIELD">("FIELD");

  // --- NEW TEAM MEMBER STATES ---
  const [memberInput, setMemberInput] = useState("");
  const [memberRole, setMemberRole] = useState("Rigger");
  const [memberList, setMemberList] = useState<{ name: string; role: string }[]>([]);

  // --- PHOTO & CAMERA STATES ---
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const status = !attendance ? "no-entry" : attendance.timeOut ? "completed" : "checked-in";

  const isValidationError = useMemo(() => {
    if (workCategory !== "FIELD" || !locationValue || !siteIdInput) return false;
    return siteIdInput !== locationValue;
  }, [workCategory, locationValue, siteIdInput]);

  const themeColor = status === 'completed' ? '#16a34a' : status === 'checked-in' ? '#2563eb' : '#C62828';
  const bgColor = status === 'completed' ? 'bg-green-50/50' : status === 'checked-in' ? 'bg-blue-50/50' : 'bg-slate-50';

  // --- NEW TEAM LIST LOGIC ---
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

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Camera access denied.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      setCapturedPhoto(canvas.toDataURL("image/jpeg"));
      stopCamera();
    }
  };

  // --- UPLOAD LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Max 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setCapturedPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    async function loadSites() {
      try {
        const sites = await getSites();
        if (sites && sites.length > 0) setActiveSites(sites);
      } catch (err) { console.error("Failed to load sites."); }
    }
    loadSites();
  }, []);

  useEffect(() => {
    async function fetchStatus() {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmail) { setAttendance(null); return; }
      try {
        const data = await getAttendanceStatus(email);
        setAttendance(data);
        if (data) {
          setLocationValue(data.siteId || data.department || "");
          setSiteIdInput(data.siteId || "");
          setActivities(data.activities || "");
          // SYNC: Load members from database if they exist
          if (data.members) setMemberList(data.members as any);
        }
      } catch (err) { console.error("Failed to fetch status:", err); }
    }
    fetchStatus();
  }, [email]);

  const handleAction = async () => {
    if (isValidationError || !email || !locationValue || !capturedPhoto) return;
   
    setLoading(true);
    try {
      const action = status === "no-entry" ? "time_in" : "time_out";
     
      const data = await performAttendanceAction(
        email,
        action,
        locationValue,
        workCategory,
        activities,
        { photo: capturedPhoto },
        memberList // PASSING TEAM DATA
      );

      setAttendance(data);
      setCapturedPhoto(null);
      toast.success(action === "time_in" ? "Clocked In Successfully" : "Clocked Out Successfully");
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

  const sitesList = activeSites.length > 0 ? activeSites : PROJECT_SITES;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${bgColor}`} suppressHydrationWarning>
      <Card className="w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-0 rounded-none bg-white overflow-hidden">
        <div className="h-2 w-full transition-colors duration-500" style={{ backgroundColor: themeColor }}></div>
       
        <CardHeader className="px-8 pt-10 pb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
               <div className="p-2 bg-slate-100 rounded-sm">
                 <Clock size={18} style={{ color: themeColor }} />
               </div>
               <CardTitle className="text-2xl font-black uppercase tracking-tighter text-slate-800">Portal</CardTitle>
            </div>
            <Badge className="uppercase text-[9px] font-black tracking-widest px-3 py-1 rounded-none border-none text-white transition-colors duration-500" style={{ backgroundColor: themeColor }}>
              {status === "no-entry" ? "Offline" : status === "checked-in" ? "Active Shift" : "Shift Logged"}
            </Badge>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Martindale Technologies Inc.</p>
        </CardHeader>
       
        <CardContent className="px-8 space-y-6">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 border border-slate-200">
            <button type="button" disabled={status !== "no-entry"}
              onClick={() => { setWorkCategory("HEAD_OFFICE"); setLocationValue(""); setSiteIdInput(""); }}
              className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase transition-all ${workCategory === "HEAD_OFFICE" ? "bg-white text-[#C62828] shadow-sm" : "text-slate-400 hover:text-slate-600 disabled:opacity-50"}`}>
              <Building2 size={14} /> Head Office
            </button>
            <button type="button" disabled={status !== "no-entry"}
              onClick={() => { setWorkCategory("FIELD"); setLocationValue(""); setSiteIdInput(""); }}
              className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase transition-all ${workCategory === "FIELD" ? "bg-white text-[#C62828] shadow-sm" : "text-slate-400 hover:text-slate-600 disabled:opacity-50"}`}>
              <HardHat size={14} /> Field Work
            </button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.15em]"><Mail size={14} style={{ color: themeColor }}/> COMPANY EMAIL</Label>
              <input className="w-full p-4 bg-slate-50 border border-slate-200 focus:ring-2 outline-none text-sm font-semibold" style={{ '--tw-ring-color': themeColor } as any} placeholder="email@martindaletech.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={status !== "no-entry"} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.15em]"><Camera size={14} style={{ color: themeColor }}/> Identity Verification</Label>
             
              {!capturedPhoto ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" disabled={status === "completed"} onClick={startCamera} className="h-24 border-dashed border-2 flex flex-col gap-2 rounded-none hover:bg-slate-50">
                    <Camera size={20} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase">Live Camera</span>
                  </Button>

                  <div className="relative">
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />
                    <Button type="button" variant="outline" disabled={status === "completed"} onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-dashed border-2 flex flex-col gap-2 rounded-none hover:bg-slate-50">
                      <Upload size={20} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase">Upload Pic</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <img src={capturedPhoto} alt="Preview" className="w-full h-48 object-cover border border-slate-200 shadow-inner" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={() => setCapturedPhoto(null)} className="p-2 bg-white rounded-full text-red-600 shadow-lg"><X size={18} /></button>
                    <button onClick={startCamera} className="p-2 bg-white rounded-full text-blue-600 shadow-lg"><RotateCcw size={18} /></button>
                  </div>
                </div>
              )}
            </div>

            {/* TEAM MEMBER LOGIC ADDED HERE */}
            <div className="space-y-3 pt-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.15em]"><Users size={14} style={{ color: themeColor }}/> Team Members</Label>
              <div className="flex gap-2">
                <input disabled={status !== "no-entry"} className="flex-1 p-3 bg-slate-50 border border-slate-200 text-xs font-semibold outline-none" placeholder="Name" value={memberInput} onChange={(e) => setMemberInput(e.target.value)} />
                <select disabled={status !== "no-entry"} className="p-3 bg-slate-50 border border-slate-200 text-xs font-semibold outline-none" value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                  {JOB_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <Button type="button" onClick={addMember} disabled={status !== "no-entry"} variant="outline" className="border-slate-200"><UserPlus size={16}/></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {memberList.map((m, i) => (
                  <Badge key={i} className="bg-slate-100 text-slate-700 border-none rounded-none px-2 py-1 text-[10px] font-bold flex gap-2">
                    {m.name} ({m.role})
                    {status === "no-entry" && <X size={12} className="cursor-pointer" onClick={() => removeMember(i)}/>}
                  </Badge>
                ))}
              </div>
            </div>

            {workCategory === "FIELD" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.15em]"><Hash size={14} style={{ color: themeColor }}/> Project Site ID</Label>
                <select className={`w-full p-4 bg-slate-50 border ${isValidationError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} outline-none text-sm font-semibold`} value={siteIdInput} onChange={(e) => setSiteIdInput(e.target.value)} disabled={status !== "no-entry"}>
                  <option value="">Select ID...</option>
                  {sitesList.map((site: any) => <option key={site.id} value={site.id}>{site.siteIdCode || "NO CODE"}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.15em]"><MapPin size={14} style={{ color: themeColor }}/> {workCategory === "HEAD_OFFICE" ? "Department" : "Project Site Name"}</Label>
              <select className={`w-full p-4 bg-slate-50 border ${isValidationError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} outline-none text-sm font-semibold`} value={locationValue} onChange={(e) => setLocationValue(e.target.value)} disabled={status !== "no-entry"}>
                <option value="">Select {workCategory === "HEAD_OFFICE" ? "Department" : "Site Name"}...</option>
                {workCategory === "HEAD_OFFICE" ? DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>) : sitesList.map((site: any) => <option key={site.id} value={site.id}>{site.siteName}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.15em]"><ClipboardList size={14} style={{ color: themeColor }}/> Daily Accomplishment Report</Label>
              <textarea placeholder={status === "no-entry" ? "Locked: Time In first..." : "What did you accomplish?"} className="w-full p-4 border bg-slate-50 text-sm font-semibold min-h-[100px] resize-none" value={activities} onChange={(e) => setActivities(e.target.value)} disabled={status === "no-entry" || status === "completed"} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0 border border-slate-100 divide-x divide-slate-100">
            <div className="py-4 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time In</p>
              <p className="text-xl font-black text-slate-800">{formatTime(attendance?.timeIn)}</p>
            </div>
            <div className="py-4 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Out</p>
              <p className="text-xl font-black text-slate-800">{formatTime(attendance?.timeOut)}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-8 pb-10 pt-4">
          {status !== "completed" ? (
            <Button onClick={handleAction} disabled={loading || !email || !locationValue || !capturedPhoto || isValidationError} className="w-full py-8 text-xs font-black uppercase tracking-[0.3em] rounded-none shadow-xl text-white border-none" style={{ backgroundColor: isValidationError ? '#94a3b8' : themeColor }}>
              {loading ? "Processing..." : <span className="flex items-center gap-3">{status === "no-entry" ? <LogIn size={20} /> : <LogOut size={20} />} {status === "no-entry" ? "Confirm Time In" : "Confirm Time Out"}</span>}
            </Button>
          ) : (
            <div className="w-full py-5 bg-green-600 text-white flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.3em] shadow-lg"><CheckCircle size={20} /> Shift Logged</div>
          )}
        </CardFooter>
      </Card>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-md aspect-video bg-slate-900 overflow-hidden shadow-2xl border-4 border-white">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
          </div>
          <div className="flex gap-6 mt-10">
            <Button onClick={stopCamera} variant="ghost" className="text-white border border-white/20 rounded-full h-16 w-16 p-0"><X size={24} /></Button>
            <Button onClick={takePhoto} className="h-20 w-20 bg-white hover:bg-slate-100 rounded-full p-0 shadow-2xl"><div className="h-16 w-16 rounded-full border-4 border-slate-800" /></Button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}