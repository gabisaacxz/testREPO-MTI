"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, LogIn, LogOut, CheckCircle, Building2, HardHat, Mail, Clock, AlertCircle, Hash } from "lucide-react"; 
import { getAttendanceStatus, performAttendanceAction, getSites } from "@/app/attendance/actions/attendance";
import { DEPARTMENTS, PROJECT_SITES, WorkCategory } from "@/lib/validations/attendance"; 
import { toast } from "sonner";

export default function AttendancePage() {
  const [email, setEmail] = useState("");
  const [locationValue, setLocationValue] = useState(""); // This stores Site Name ID or Dept Name
  const [siteIdInput, setSiteIdInput] = useState("");    // NEW: Specifically for Site ID dropdown
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);
  const [activeSites, setActiveSites] = useState<any[]>([]);
  const [workCategory, setWorkCategory] = useState<"HQ" | "FIELD">("FIELD");

  const status = !attendance ? "no-entry" : attendance.timeOut ? "completed" : "checked-in";

  // 1. Validation Logic: Check if ID and Name selection match
  const isValidationError = useMemo(() => {
    if (workCategory !== "FIELD" || !locationValue || !siteIdInput) return false;
    // Ensure the ID selected matches the Site Name selected
    return siteIdInput !== locationValue;
  }, [workCategory, locationValue, siteIdInput]);

  const themeColor = status === 'completed' ? '#16a34a' : status === 'checked-in' ? '#2563eb' : '#C62828';
  const bgColor = status === 'completed' ? 'bg-green-50/50' : status === 'checked-in' ? 'bg-blue-50/50' : 'bg-slate-50';

  useEffect(() => {
    async function loadSites() {
      try {
        const sites = await getSites();
        if (sites && sites.length > 0) setActiveSites(sites);
      } catch (err) {
        console.error("Failed to load dynamic sites.");
      }
    }
    loadSites();
  }, []);

  useEffect(() => {
    async function fetchStatus() {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmail) {
        setAttendance(null);
        return;
      }
      try {
        const data = await getAttendanceStatus(email);
        setAttendance(data);
        if (data) {
          setLocationValue(data.siteId || data.department || "");
          setSiteIdInput(data.siteId || "");
        }
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    }
    fetchStatus();
  }, [email]);

  const handleAction = async () => {
    if (isValidationError) return;
    if (!email || !locationValue) {
      toast.error(`Required: Email and ${workCategory === "HQ" ? "Department" : "Site Details"}`);
      return;
    }
    setLoading(true);
    try {
      const action = status === "no-entry" ? "check_in" : "check_out";
      const data = await performAttendanceAction(email, action, locationValue);
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

  // Combine DB and Constant sites for the list
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
            <button type="button" disabled={status !== "no-entry"} onClick={() => { setWorkCategory("HQ"); setLocationValue(""); setSiteIdInput(""); }}
              className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase transition-all ${workCategory === "HQ" ? "bg-white text-[#C62828] shadow-sm" : "text-slate-400 hover:text-slate-600 disabled:opacity-50"}`}>
              <Building2 size={14} /> Head Office
            </button>
            <button type="button" disabled={status !== "no-entry"} onClick={() => { setWorkCategory("FIELD"); setLocationValue(""); setSiteIdInput(""); }}
              className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase transition-all ${workCategory === "FIELD" ? "bg-white text-[#C62828] shadow-sm" : "text-slate-400 hover:text-slate-600 disabled:opacity-50"}`}>
              <HardHat size={14} /> Field Work
            </button>
          </div>

          <div className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.15em]">
                <Mail size={14} style={{ color: themeColor }}/> COMPANY EMAIL
              </Label>
              <input className="w-full p-4 bg-slate-50 border border-slate-200 focus:ring-2 outline-none transition-all text-sm font-semibold"
                style={{ '--tw-ring-color': themeColor } as any} placeholder="email@mti.com.ph" value={email} onChange={(e) => setEmail(e.target.value)} disabled={status !== "no-entry"} />
            </div>

            {/* NEW: Project Site ID Dropdown (Field only) */}
            {workCategory === "FIELD" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.15em]">
                  <Hash size={14} style={{ color: themeColor }}/> Project Site ID
                </Label>
                <select className={`w-full p-4 bg-slate-50 border ${isValidationError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} outline-none cursor-pointer text-sm font-semibold focus:ring-2 transition-all`}
                  style={{ '--tw-ring-color': isValidationError ? '#ef4444' : themeColor } as any} value={siteIdInput} onChange={(e) => setSiteIdInput(e.target.value)} disabled={status !== "no-entry"}>
                  <option value="">Select ID...</option>
                  {sitesList.map((site: any) => (
                    <option key={site.id} value={site.id}>{site.siteIdCode || site.id.substring(0,8).toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Site Name / Department Dropdown */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.15em]">
                <MapPin size={14} style={{ color: themeColor }}/> 
                {workCategory === "HQ" ? "Department" : "Project Site Name"}
              </Label>
              <select className={`w-full p-4 bg-slate-50 border ${isValidationError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} outline-none cursor-pointer text-sm font-semibold focus:ring-2 transition-all`}
                style={{ '--tw-ring-color': isValidationError ? '#ef4444' : themeColor } as any} value={locationValue} onChange={(e) => setLocationValue(e.target.value)} disabled={status !== "no-entry"}>
                <option value="">Select {workCategory === "HQ" ? "Department" : "Site Name"}...</option>
                {workCategory === "HQ" ? (
                  DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)
                ) : (
                  sitesList.map((site: any) => <option key={site.id} value={site.id}>{site.siteName || site.name}</option>)
                )}
              </select>
              
              {/* ERROR MESSAGE */}
              {isValidationError && (
                <p className="text-[10px] font-bold text-red-600 flex items-center gap-1 animate-pulse">
                  <AlertCircle size={12} /> Site ID and Site Name must match selection.
                </p>
              )}
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
            <Button 
              onClick={handleAction}
              disabled={loading || !email || !locationValue || isValidationError}
              className="w-full py-8 text-xs font-black uppercase tracking-[0.3em] rounded-none shadow-xl transition-all disabled:opacity-30 text-white border-none"
              style={{ backgroundColor: isValidationError ? '#94a3b8' : themeColor }}
            >
              {loading ? "Establishing Connection..." : (
                <span className="flex items-center gap-3">
                  {status === "no-entry" ? <LogIn size={20} /> : <LogOut size={20} />}
                  {status === "no-entry" ? "Confirm Time In" : "Confirm Time Out"}
                </span>
              )}
            </Button>
          ) : (
            <div className="w-full py-5 bg-green-600 text-white flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.3em] shadow-lg shadow-green-900/20">
              <CheckCircle size={20} /> Shift Successfully Logged
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}