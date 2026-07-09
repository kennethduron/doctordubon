import { RecentMovements } from "@/components/dashboard/recent-movements";
import { ExpenseForm } from "@/components/forms/expense-form";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMovements } from "@/data/mock-data";
import { expenseCategories } from "@/lib/constants";

export default function ExpensesPage() {
  const expenseMovements = mockMovements.filter((movement) => movement.type === "expense");

  return (
    <AppShell title="Gastos" subtitle="Registro de salidas de dinero y costos operativos.">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <ExpenseForm />
        <Card>
          <CardHeader>
            <CardTitle>Categorias de gastos</CardTitle>
            <CardDescription>Base preparada para catalogos editables.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {expenseCategories.map((category) => (
              <div key={category} className="rounded-md bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{category}</div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <RecentMovements movements={expenseMovements} />
      </div>
    </AppShell>
  );
}


