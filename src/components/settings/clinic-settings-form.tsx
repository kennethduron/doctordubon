'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { getClinicSettings, saveClinicSettings } from '@/lib/clinics';
import { APP_URL, CLINIC_NAME, CURRENCY, DOCTOR_NAME } from '@/lib/constants';
import type { ClinicSettingsInput } from '@/types/clinic';

const initialSettings: ClinicSettingsInput = {
  clinicName: CLINIC_NAME,
  doctorName: DOCTOR_NAME,
  email: 'consultorio@doctordubon.com',
  phone: '',
  currency: CURRENCY,
  appUrl: APP_URL,
};

export function ClinicSettingsForm() {
  const { userProfile } = useAuth();
  const [settings, setSettings] = useState<ClinicSettingsInput>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!userProfile?.clinicId || userProfile.status !== 'active') {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getClinicSettings(userProfile.clinicId);
        setSettings({
          clinicName: result.clinicName,
          doctorName: result.doctorName,
          email: result.email,
          phone: result.phone,
          currency: result.currency,
          appUrl: result.appUrl,
        });
      } catch {
        setError('No se pudo cargar la configuración del consultorio.');
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, [userProfile?.clinicId, userProfile?.status]);

  function updateField(field: keyof ClinicSettingsInput, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!userProfile) {
      setError('No se pudo identificar tu perfil de usuario.');
      return;
    }

    if (!settings.clinicName.trim() || !settings.doctorName.trim() || !settings.email.trim()) {
      setError('Completa el nombre del consultorio, el doctor y el correo.');
      return;
    }

    setSaving(true);

    try {
      await saveClinicSettings({
        ...settings,
        clinicName: settings.clinicName.trim(),
        doctorName: settings.doctorName.trim(),
        email: settings.email.trim(),
        phone: settings.phone.trim(),
      }, userProfile);
      setMessage('Configuración guardada correctamente.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la configuración.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del consultorio</CardTitle>
        <CardDescription>Información base del consultorio para reportes y uso diario.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className={'grid gap-4'} onSubmit={handleSubmit}>
          <div className={'grid gap-4 md:grid-cols-2'}>
            <Input id={'clinic-name'} label={'Nombre del consultorio'} value={settings.clinicName} required disabled={loading || saving} onChange={(event) => updateField('clinicName', event.target.value)} />
            <Input id={'doctor-name'} label={'Nombre del doctor'} value={settings.doctorName} required disabled={loading || saving} onChange={(event) => updateField('doctorName', event.target.value)} />
            <Input id={'clinic-email'} label={'Correo del consultorio'} type={'email'} value={settings.email} required disabled={loading || saving} onChange={(event) => updateField('email', event.target.value)} />
            <Input id={'clinic-phone'} label={'Teléfono'} value={settings.phone} disabled={loading || saving} onChange={(event) => updateField('phone', event.target.value)} />
            <Select id={'currency'} label={'Moneda'} options={[{ value: 'HNL', label: 'HNL - Lempiras' }]} value={settings.currency} disabled />
            <Input id={'system-url'} label={'URL del sistema'} value={APP_URL} readOnly />
          </div>
          {loading ? <p className={'rounded-md bg-primary-soft p-3 text-sm font-medium text-primary'}>Cargando configuración...</p> : null}
          {message ? <p className={'rounded-md bg-mint p-3 text-sm font-medium text-mint-strong'}>{message}</p> : null}
          {error ? <p className={'rounded-md bg-danger-soft p-3 text-sm font-medium text-danger'}>{error}</p> : null}
          <div className={'flex justify-end'}>
            <Button type={'submit'} disabled={loading || saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
