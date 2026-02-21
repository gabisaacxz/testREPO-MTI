"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ChevronRight, MapPin, Badge, ShieldCheck } from "lucide-react";

/**
 * RESTORED HOME PAGE - MTI Portal
 * Focus: High-Contrast Industrial UI & Martindale Branding
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* 1. Slim Hero Section with Gradient Depth */}
      <section className="bg-gradient-to-br from-[#C62828] via-[#B71C1C] to-[#8E0000] text-white py-12 md:py-16 px-4 shadow-xl relative overflow-hidden">
        {/* Subtle Carbon Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
       
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-16 -translate-y-16"></div>

        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full border border-white/10 mb-2">
            <ShieldCheck size={12} className="text-white/60" />
            <p className="text-[9px] text-white/80 font-black uppercase tracking-[0.3em]">
              Secure Operations Portal
            </p>
          </div>
         
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-tight italic drop-shadow-lg">
            WEB <span className="text-white/30 not-italic">Attendance</span>
          </h1>
         
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="h-[2px] w-16 bg-white/20"></div>
            <p className="text-white/90 text-[10px] md:text-xs font-black tracking-[0.25em] uppercase italic">
              PHILIPPINES · AUSTRALIA · PAPUA NEW GUINEA
            </p>
            <div className="h-[2px] w-16 bg-white/20"></div>
          </div>
        </div>
      </section>

      {/* 2. Navigation Area */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 pb-24 relative z-20">
        <div className="flex justify-center">
          <Link href="/attendance" className="w-full max-w-md">
            {/* Card: Heavy Industrial Shadow with MTI Red Accent */}
            <Card className="group border-0 shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-red-900/30 hover:-translate-y-2 transition-all duration-500 cursor-pointer rounded-none bg-white overflow-hidden">
              {/* Top Accent Bar */}
              <div className="h-2 w-full bg-[#C62828]"></div>
             
              <CardHeader className="px-8 pt-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="bg-slate-50 w-14 h-14 rounded-none flex items-center justify-center group-hover:bg-[#C62828] transition-all duration-300 border border-slate-100 shadow-inner">
                      <Clock
                        className="text-[#C62828] group-hover:text-white transition-colors"
                        size={26}
                        strokeWidth={2.5}
                      />
                    </div>
                    <Badge className="bg-slate-900 text-white hover:bg-slate-900 border-none text-[8px] font-black tracking-[0.2em] px-3 py-1 rounded-none">
                        V7.3.0-PRO
                    </Badge>
                </div>
               
                <CardTitle className="text-2xl font-black uppercase tracking-tight text-slate-800 group-hover:text-[#C62828] transition-colors">
                  Attendance Tracker
                </CardTitle>
               
                <div className="flex items-center gap-2 mt-2">
                    <div className="p-1 bg-red-50">
                      <MapPin size={10} className="text-[#C62828]" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Multi-Regional Logging
                    </p>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8 mt-2">
                <p className="text-slate-500 mb-8 leading-relaxed font-semibold text-xs border-l-2 border-slate-100 pl-4">
                  Official MTI logging portal for Head Office departments and Field project sites.
                </p>
               
                {/* Action Footer Button Style */}
                <div className="flex items-center justify-between py-4 px-5 bg-slate-50 group-hover:bg-[#C62828] transition-all duration-300 border border-slate-100 group-hover:border-[#C62828]">
                    <span className="text-slate-900 group-hover:text-white font-black uppercase text-[11px] tracking-[0.3em]">
                      Access Portal
                    </span>
                    <ChevronRight size={18} strokeWidth={4} className="text-[#C62828] group-hover:text-white group-hover:translate-x-2 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
       
        {/* Corporate Footer */}
        <div className="text-center mt-16 space-y-2 opacity-60">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
              Martindale Technologies Inc.
            </p>
            <div className="h-px w-8 bg-slate-300 mx-auto"></div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              Automated Operations Division © 2026
            </p>
        </div>
      </div>
    </div>
  );
}