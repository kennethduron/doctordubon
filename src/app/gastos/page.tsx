import { AppShell } from "@/components/layout/app-shell";
import { MovementEntryPage } from "@/components/movements/movement-entry-page";

export default function ExpensesPage() {
  return (
    <AppShell title="Gastos" subtitle="Registro de salidas de dinero y costos operativos.">
      <MovementEntryPage type="expense" />
    </AppShell>
  );
}
