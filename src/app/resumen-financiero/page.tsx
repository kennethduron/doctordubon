import { FinancialSummaryContent } from "@/components/dashboard/financial-summary-content";
import { AppShell } from "@/components/layout/app-shell";

export default function FinancialSummaryPage() {
  return (
    <AppShell title="Resumen financiero" subtitle="Totales del día, del mes y balance operativo.">
      <FinancialSummaryContent />
    </AppShell>
  );
}
