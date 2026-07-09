import { MovementForm } from "@/components/forms/movement-form";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { mockMovements } from "@/data/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DailyBookPage() {
  return (
    <AppShell title="Libro diario" subtitle="Registro central de ingresos y gastos del consultorio." showExports>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <MovementForm mode="general" />

        <Card>
          <CardHeader>
            <CardTitle>Movimientos recientes</CardTitle>
            <CardDescription>Tabla financiera con estado y acciones preparadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <thead>
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Tipo</Th>
                    <Th>Categoria</Th>
                    <Th>Descripcion</Th>
                    <Th>Metodo</Th>
                    <Th className="text-right">Monto</Th>
                    <Th>Estado</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {mockMovements.map((movement) => (
                    <tr key={movement.id}>
                      <Td>{formatDate(movement.date)}</Td>
                      <Td>
                        <Badge variant={movement.type === "income" ? "income" : "expense"}>
                          {movement.type === "income" ? "Ingreso" : "Gasto"}
                        </Badge>
                      </Td>
                      <Td>{movement.category}</Td>
                      <Td>{movement.description}</Td>
                      <Td>{movement.paymentMethod}</Td>
                      <Td className="text-right font-semibold">{formatCurrency(movement.amount)}</Td>
                      <Td><Badge>{movement.status}</Badge></Td>
                      <Td className="font-semibold text-primary">Ver</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="grid gap-3 lg:hidden">
              {mockMovements.map((movement) => (
                <article key={movement.id} className="rounded-md border border-border-soft bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{movement.description}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(movement.date)} · {movement.category}</p>
                    </div>
                    <Badge variant={movement.type === "income" ? "income" : "expense"}>
                      {movement.type === "income" ? "Ingreso" : "Gasto"}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Metodo</p>
                      <p className="font-medium text-slate-800">{movement.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Estado</p>
                      <p className="font-medium text-slate-800">{movement.status}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-950">{formatCurrency(movement.amount)}</p>
                    <p className="text-sm font-semibold text-primary">Ver</p>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}


