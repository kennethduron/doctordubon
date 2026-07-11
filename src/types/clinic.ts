export type Clinic = {
  id: string;
  name: string;
  doctorName: string;
  email: string;
  phone: string;
  currency: "HNL";
  createdAt: string;
  updatedAt: string;
};

export type ClinicSettings = {
  clinicName: string;
  doctorName: string;
  email: string;
  phone: string;
  currency: 'HNL';
  appUrl: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type ClinicSettingsInput = Omit<ClinicSettings, 'updatedAt' | 'updatedBy'>;

