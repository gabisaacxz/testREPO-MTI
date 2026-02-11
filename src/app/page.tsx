import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[var(--color-mti-navy)] text-white py-14 md:py-20 px-4 shadow-inner">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-tight">
            Attendance Checker
          </h1>
          <div className="h-2 w-24 bg-white mx-auto"></div>
          <p className="text-white/90 max-w-xl mx-auto text-base md:text-lg font-bold tracking-[0.15em] uppercase">
            Philippines · Australia · Papua New Guinea
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-12 pb-24">
        <div className="flex justify-center">
          <Link href="/attendance" className="w-full max-w-md">
            <Card className="group border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-none bg-white">
              <CardHeader className="border-t-4 border-[var(--color-mti-navy)]">
                <div className="bg-gray-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-[var(--color-mti-navy)] transition-colors">
                  <Clock className="text-[var(--color-mti-navy)] group-hover:text-white transition-colors" size={26} />
                </div>
                <CardTitle className="text-xl font-bold uppercase tracking-wider text-[var(--color-mti-slate)]">
                  Log Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-6 leading-relaxed font-medium">
                  Official portal for daily Time In and Time Out logging.
                </p>
                <div className="flex items-center text-[var(--color-mti-navy)] font-bold uppercase text-xs tracking-widest group-hover:gap-4 gap-2 transition-all">
                  Proceed to Logging <ChevronRight size={16} />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}