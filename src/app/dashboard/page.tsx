import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardPage() {
  return (
    <AppShell title="Panel principal" subtitle="Vista general de la actividad financiera del consultorio.">
      <DashboardContent />
    </AppShell>
  );
}
