import { AppShell } from '@/components/layout/app-shell';
import { ClinicSettingsForm } from '@/components/settings/clinic-settings-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_URL } from '@/lib/constants';
import { getFirebasePlaceholder } from '@/lib/firebase';

export default function SettingsPage() {
  const systemStatus = getFirebasePlaceholder();

  return (
    <AppShell
      title={'Configuración'}
      subtitle={'Datos generales del consultorio para reportes y uso diario.'}
      allowedRoles={['technical_owner', 'business_owner']}
    >
      <div className={'grid gap-6 xl:grid-cols-[1fr_360px]'}>
        <ClinicSettingsForm />

        <div className={'grid gap-6'}>
          <Card>
            <CardHeader>
              <CardTitle>Estado del sistema</CardTitle>
              <CardDescription>Preparación para iniciar sesión y guardar movimientos.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={'text-sm text-slate-600'}>
                {systemStatus.ready ? 'El sistema está conectado para operar en producción.' : 'Falta completar la conexión del sistema.'}
              </p>
              <p className={'mt-3 text-xs font-semibold text-primary'}>Estado: {systemStatus.ready ? 'Listo' : 'Pendiente'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Producción</CardTitle>
              <CardDescription>Dirección final para el consultorio.</CardDescription>
            </CardHeader>
            <CardContent className={'grid gap-3'}>
              <p className={'break-all text-sm font-semibold text-slate-900'}>{APP_URL}</p>
              <p className={'text-sm leading-6 text-slate-600'}>Dirección pública del sistema para el consultorio.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
