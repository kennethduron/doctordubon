import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getResendPlaceholder } from "@/lib/resend";
import { mockClinic } from "@/data/mock-data";

function getFirebaseStatus() {
  const ready = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );

  return {
    ready,
    message: ready
      ? "Firebase Authentication y Cloud Firestore están configurados."
      : "Configura las variables de Firebase en .env.local para activar Auth y Firestore.",
  };
}

export default function SettingsPage() {
  const firebase = getFirebaseStatus();
  const resend = getResendPlaceholder();

  return (
    <AppShell title="Configuración" subtitle="Datos generales del consultorio y preparación técnica.">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Datos del consultorio</CardTitle>
            <CardDescription>Información base para reportes, correos y configuración fiscal futura.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input id="clinic-name" label="Nombre del consultorio" defaultValue={mockClinic.name} />
                <Input id="doctor-name" label="Nombre del doctor" defaultValue={mockClinic.doctorName} />
                <Input id="clinic-email" label="Correo del consultorio" type="email" defaultValue={mockClinic.email} />
                <Input id="clinic-phone" label="Teléfono" defaultValue={mockClinic.phone} />
                <Select id="currency" label="Moneda" options={["HNL - Lempiras"]} defaultValue="HNL - Lempiras" />
              </div>
              <div className="flex justify-end">
                <Button type="button">Guardar cambios</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Firebase</CardTitle>
              <CardDescription>Auth y Firestore preparados para sesión real.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{firebase.message}</p>
              <p className="mt-3 text-xs font-semibold text-primary">Estado: {firebase.ready ? "Configurado" : "Pendiente"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resend</CardTitle>
              <CardDescription>Correos personalizados pendientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{resend.message}</p>
              <p className="mt-3 text-xs font-semibold text-primary">Estado: {resend.ready ? "Configurado" : "Pendiente"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
