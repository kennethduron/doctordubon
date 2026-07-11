import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { APP_URL, CLINIC_NAME, CURRENCY, DOCTOR_NAME } from '@/lib/constants';
import { db } from '@/lib/firebase';
import type { ClinicSettings, ClinicSettingsInput } from '@/types/clinic';
import type { UserProfile } from '@/types/user';

function defaultSettings(): ClinicSettings {
  return {
    clinicName: CLINIC_NAME,
    doctorName: DOCTOR_NAME,
    email: 'consultorio@doctordubon.com',
    phone: '',
    currency: CURRENCY,
    appUrl: APP_URL,
  };
}

export async function getClinicSettings(clinicId: string): Promise<ClinicSettings> {
  const snapshot = await getDoc(doc(db, 'clinics', clinicId));

  if (!snapshot.exists()) {
    return defaultSettings();
  }

  const data = snapshot.data();
  return {
    clinicName: typeof data.clinicName === 'string' ? data.clinicName : CLINIC_NAME,
    doctorName: typeof data.doctorName === 'string' ? data.doctorName : DOCTOR_NAME,
    email: typeof data.email === 'string' ? data.email : '',
    phone: typeof data.phone === 'string' ? data.phone : '',
    currency: 'HNL',
    appUrl: typeof data.appUrl === 'string' ? data.appUrl : APP_URL,
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
  };
}

export async function saveClinicSettings(settings: ClinicSettingsInput, currentUser: UserProfile) {
  if (
    currentUser.status !== 'active'
    || (currentUser.role !== 'technical_owner' && currentUser.role !== 'business_owner')
  ) {
    throw new Error('No tienes permiso para actualizar la configuración.');
  }

  await setDoc(doc(db, 'clinics', currentUser.clinicId), {
    ...settings,
    currency: 'HNL',
    appUrl: APP_URL,
    updatedAt: serverTimestamp(),
    updatedBy: currentUser.id,
  });
}
