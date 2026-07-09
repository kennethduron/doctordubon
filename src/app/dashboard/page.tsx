import Link from "next/link";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMovements } from "@/data/mock-data";
import { formatCurrency, summarizeMovements } from "@/lib/utils";

export default function DashboardPage() {
  const todayMovements = mockMovements.filter((movement) => movement.date === "2026-07-09");
  const today = summarizeMovements(todayMovements);
  const month = summarizeMovements(mockMovements);

  const quickActions = [
    { href: "/ingresos", label: "Nuevo ingreso" },
    { href: "/gastos", label: "Nuevo gasto" },
    { href: "/libro-diario", label: "Ver libro diario" },
    { href: "/reportes", label: "Ver reportes" },
  ];

  return (
    <AppShell title="Panel principal" subtitle="Vista general de la actividad financiera del consultorio.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Ingresos de hoy" value={formatCurrency(today.income)} helper="Servicios cobrados hoy" tone="income" icon="+" />
        <StatCard title="Gastos de hoy" value={formatCurrency(today.expense)} helper="Salidas registradas hoy" tone="expense" icon="-" />
        <StatCard title="Balance del dia" value={formatCurrency(today.balance)} helper="Ingresos menos gastos" tone="balance" icon="=" />
        <StatCard title="Ingresos del mes" value={formatCurrency(month.income)} helper="Total acumulado mensual" tone="income" icon="+" />
        <StatCard title="Gastos del mes" value={formatCurrency(month.expense)} helper="Total operativo mensual" tone="expense" icon="-" />
        <StatCard title="Balance del mes" value={formatCurrency(month.balance)} helper="Resultado neto mensual" tone="balance" icon="=" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <RecentMovements movements={mockMovements.slice(0, 5)} />
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Atajos para registrar y consultar informacion.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className={buttonStyles("secondary", "w-full justify-center")}>
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}


