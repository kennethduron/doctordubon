import Link from "next/link";
import { ArrowUpRight, BookOpen, ClipboardPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { paymentMethodLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/finance";
import { formatDate } from "@/lib/utils";
import type { Movement } from "@/types/movement";

export function RecentMovements({ movements }: { movements: Movement[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Últimos movimientos</CardTitle>
          <CardDescription>Registros recientes del libro diario financiero.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sky-200 bg-[linear-gradient(135deg,#f8fcff,#f1f7fb)] px-5 py-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary shadow-inner">
              <ClipboardPlus className="h-10 w-10" />
            </div>
            <p className="mt-5 text-base font-bold text-slate-900">Aún no hay movimientos recientes.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Cuando registres ingresos o gastos, aparecerán aquí automáticamente.
            </p>
            <Link href="/ingresos" className={buttonStyles("secondary", "mt-5 rounded-lg")}>Registrar primer ingreso</Link>
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
              <article key={movement.id} className="rounded-lg border border-border-soft bg-slate-50 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{movement.category}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(movement.date)} · {paymentMethodLabels[movement.paymentMethod]}</p>
                  </div>
                  <Badge variant={movement.type === "income" ? "income" : "expense"}>
                    {movement.type === "income" ? "Ingreso" : "Gasto"}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-slate-950">{formatCurrency(movement.amount)}</p>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
