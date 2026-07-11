import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, ClipboardPlus } from "lucide-react";
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
      <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Últimos movimientos</CardTitle>
            <CardDescription>Registros recientes del libro diario financiero.</CardDescription>
          </div>
        </div>
        {movements.length > 0 ? (
          <Link href="/libro-diario" className="hidden text-sm font-semibold text-primary hover:underline sm:inline-flex">
            Ver todos
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="p-4">
        {movements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sky-200 bg-[linear-gradient(135deg,#f8fcff,#f1f7fb)] px-4 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary shadow-inner">
              <ClipboardPlus className="h-8 w-8" />
            </div>
            <p className="mt-4 text-base font-bold text-slate-900">Aún no hay movimientos recientes.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Cuando registres ingresos o gastos, aparecerán aquí automáticamente.
            </p>
            <Link href="/ingresos" className={buttonStyles("secondary", "mt-4 min-h-10 rounded-lg")}>Registrar primer ingreso</Link>
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
            {movements.map((movement) => {
              const MovementIcon = movement.type === "income" ? ArrowUpRight : ArrowDownRight;

              return (
                <article key={movement.id} className="rounded-xl border border-border-soft bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={movement.type === "income" ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-mint-strong" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger"}>
                        <MovementIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{movement.category}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{paymentMethodLabels[movement.paymentMethod]}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-xs text-slate-500">{formatDate(movement.date)}</p>
                    <p className={movement.type === "income" ? "text-lg font-bold text-mint-strong" : "text-lg font-bold text-danger"}>{formatCurrency(movement.amount)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}