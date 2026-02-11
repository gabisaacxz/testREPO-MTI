"use client"; // Add this at the top of layout.tsx to allow hooks

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Helper to check if the link is active
  const isActive = (path: string) => pathname === path;

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <header className="bg-[var(--color-mti-navy)] sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white rounded-sm flex items-center justify-center font-bold text-[var(--color-mti-navy)] text-xl shadow-inner">M</div>
              <div className="flex flex-col text-white">
                <span className="font-bold tracking-[0.15em] uppercase text-sm leading-none">Martindale</span>
                <span className="text-[9px] tracking-[0.2em] uppercase mt-0.5 opacity-80">Technologies</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-widest text-white/90">
              {/* Home Link */}
              <Link 
                href="/" 
                className={`transition-all pb-1 border-b-2 ${isActive('/') ? 'border-white text-white' : 'border-transparent hover:text-white'}`}
              >
                Home
              </Link>

              {/* Attendance Link */}
              <Link 
                href="/attendance" 
                className={`transition-all pb-1 border-b-2 ${isActive('/attendance') ? 'border-white text-white' : 'border-transparent hover:text-white'}`}
              >
                Attendance
              </Link>

              <Link href="#" className="opacity-40 cursor-not-allowed">Profile</Link>
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}