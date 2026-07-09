import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { paymentMethodLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/finance";
import { formatDate } from "@/lib/utils";
import type { Movement } from "@/types/movement";

export function RecentMovements({ movements }: { movements: Movement[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos movimientos</CardTitle>
        <CardDescription>Registros recientes del libro diario financiero.</CardDescription>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="rounded-md border border-dashed border-border-soft bg-slate-50 p-6 text-center">
            <p className="text-sm font-semibold text-slate-800">Aún no hay movimientos recientes.</p>
            <p className="mt-1 text-sm text-slate-500">Crea tu primer ingreso o gasto para comenzar.</p>
          </div>
        ) : null}

        {movements.length > 0 ? (
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <thead>
                <tr>
                  <Th>Fecha</Th>
                  <Th>Tipo</Th>
                  <Th>Categoría</Th>
                  <Th>Método</Th>
                  <Th className="text-right">Monto</Th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <Td>{formatDate(movement.date)}</Td>
                    <Td>
                      <Badge variant={movement.type === "income" ? "income" : "expense"}>
                        {movement.type === "income" ? "Ingreso" : "Gasto"}
                      </Badge>
                    </Td>
                    <Td>{movement.category}</Td>
                    <Td>{paymentMethodLabels[movement.paymentMethod]}</Td>
                    <Td className="text-right font-semibold">{formatCurrency(movement.amount)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : null}

        {movements.length > 0 ? (
          <div className="grid gap-3 md:hidden">
            {movements.map((movement) => (
              <article key={movement.id} className="rounded-md border border-border-soft bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{movement.category}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(movement.date)} · {paymentMethodLabels[movement.paymentMethod]}</p>
                  </div>
                  <Badge variant={movement.type === "income" ? "income" : "expense"}>
                    {movement.type === "income" ? "Ingreso" : "Gasto"}
                  </Badge>
                </div>
                <p className="mt-3 text-lg font-bold text-slate-950">{formatCurrency(movement.amount)}</p>
              </article>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
