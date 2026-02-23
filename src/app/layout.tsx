import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar"; // Importing your relocated Navbar

const inter = Inter({ subsets: ["latin"] });

// Note: We removed "use client" from here to keep the Root Layout as a Server Component.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* Your custom Navbar handles its own "use client" logic now */}
        <Navbar />

        <main className="min-h-[calc(100vh-64px)] bg-[#F8FAFC]">
          {children}
        </main>
        
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}