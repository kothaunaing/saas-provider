import { api } from "./client";

export type ProviderSettings = {
  platformName: string;
  supportEmail: string;
  trialDays: number;
  tenantApproval: boolean;
  maintenanceMode: boolean;
  incidentEmails: boolean;
  billingEmails: boolean;
};

export async function getSettings(): Promise<ProviderSettings> {
  const res = await api.get<ProviderSettings>("/platform/settings");
  return res.data;
}

export async function saveSettings(
  settings: ProviderSettings,
): Promise<ProviderSettings> {
  const res = await api.put<ProviderSettings>("/platform/settings", settings);
  return res.data;
}
