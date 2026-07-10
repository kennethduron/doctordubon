import { AppShell } from "@/components/layout/app-shell";
import { MovementEntryPage } from "@/components/movements/movement-entry-page";

export default function IncomePage() {
  return (
    <AppShell title="Ingresos" subtitle="Registro de pagos recibidos por servicios médicos.">
      <MovementEntryPage type="income" />
    </AppShell>
  );
}
