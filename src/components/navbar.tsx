"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const MTI_RED = "#C62828";

  return (
    <header
      className="sticky top-0 z-50 shadow-xl border-b border-white/10"
      style={{ backgroundColor: MTI_RED }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-105" style={{ color: MTI_RED }}>
            M
          </div>
          <div className="flex flex-col text-white">
            <span className="font-black tracking-[0.2em] uppercase text-sm leading-none italic">
              Martindale
            </span>
            <span className="text-[8px] tracking-[0.3em] uppercase mt-1 font-bold opacity-70">
              Technologies Inc.
            </span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-10 text-[10px] font-black uppercase tracking-[0.2em] text-white">
          <Link
            href="/"
            className={`transition-all pb-1 border-b-2 ${
              isActive('/') ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Home
          </Link>

          <Link
            href="/attendance"
            className={`transition-all pb-1 border-b-2 ${
              isActive('/attendance') ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Attendance
          </Link>

          <Link href="#" className="opacity-20 cursor-not-allowed">Profile</Link>
        </nav>
      </div>
    </header>
  );
}