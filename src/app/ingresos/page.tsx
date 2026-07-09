import { RecentMovements } from "@/components/dashboard/recent-movements";
import { IncomeForm } from "@/components/forms/income-form";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMovements } from "@/data/mock-data";
import { incomeCategories } from "@/lib/constants";

export default function IncomePage() {
  const incomeMovements = mockMovements.filter((movement) => movement.type === "income");

  return (
    <AppShell title="Ingresos" subtitle="Registro de pagos recibidos por servicios médicos.">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <IncomeForm />
        <Card>
          <CardHeader>
            <CardTitle>Categorias de ingresos</CardTitle>
            <CardDescription>Base preparada para catalogos editables.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {incomeCategories.map((category) => (
              <div key={category} className="rounded-md bg-mint px-3 py-2 text-sm font-medium text-mint-strong">{category}</div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <RecentMovements movements={incomeMovements} />
      </div>
    </AppShell>
  );
}


