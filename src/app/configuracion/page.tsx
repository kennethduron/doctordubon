import { AppShell } from '@/components/layout/app-shell';
import { ClinicSettingsForm } from '@/components/settings/clinic-settings-form';

export default function SettingsPage() {
  return (
    <AppShell
      title={'Configuración'}
      subtitle={'Datos generales del consultorio para reportes y uso diario.'}
      allowedRoles={['technical_owner', 'business_owner']}
    >
      <ClinicSettingsForm />
    </AppShell>
  );
}
