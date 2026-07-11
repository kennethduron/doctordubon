import { AppShell } from "@/components/layout/app-shell";
import { DailyBookContent } from "@/components/movements/daily-book-content";

export default function DailyBookPage() {
  return (
    <AppShell title="Libro diario" subtitle="Registro central de ingresos y gastos del consultorio.">
      <DailyBookContent />
    </AppShell>
  );
}
