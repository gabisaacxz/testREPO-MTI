import { AttendanceForm } from "./components/attendance-form";

/**
 * FIX: FORCE DYNAMIC RENDERING
 * This ensures the AttendanceForm always receives the most up-to-date 
 * list of sites and user status directly from the database on every load.
 */
export const dynamic = "force-dynamic";

export default function AttendancePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-50">
      {/* Everything (Team members, Camera, Action handlers) 
          is now safely tucked inside this component.
      */}
      <AttendanceForm />
    </div>
  );
}