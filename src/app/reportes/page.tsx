import { AppShell } from "@/components/layout/app-shell";
import { ReportsContent } from "@/components/movements/reports-content";

export default function ReportsPage() {
  return (
    <AppShell title="Reportes" subtitle="Consulta y resumen de movimientos financieros." showExports>
      <ReportsContent />
    </AppShell>
  );
}
