import { api, type PaginatedResult, type PaginationParams } from './client';

export type TenantStatus =
  | 'ACTIVE'
  | 'TRIAL'
  | 'PENDING'
  | 'SUSPENDED'
  | 'Active'
  | 'Trial'
  | 'Pending'
  | 'Suspended';

export type Tenant = {
  id: string;
  slug?: string;
  name: string;
  owner: string;
  email: string;
  city: string;
  plan: string;
  planId?: string | null;
  status: string;
  displayStatus?: string;
  joined: string;
  locations: number;
  staff: number;
  bookings: number;
  mrr: number;
  lastActive: string;
};

export interface QueryTenantsParams extends PaginationParams {
  search?: string;
  status?: string;
  planId?: string;
}

export interface CreateTenantPayload {
  slug: string;
  name: string;
  ownerName: string;
  email: string;
  city?: string;
  planId?: string;
  status?: string;
}

export interface UpdateTenantPayload {
  name?: string;
  ownerName?: string;
  email?: string;
  city?: string;
  planId?: string;
  status?: string;
}

export async function getTenants(
  params?: QueryTenantsParams,
): Promise<PaginatedResult<Tenant>> {
  const res = await api.get<PaginatedResult<Tenant>>('/platform/tenants', {
    params,
  });
  return res.data;
}

export async function getTenant(id: string): Promise<Tenant> {
  const res = await api.get<Tenant>(`/platform/tenants/${id}`);
  return res.data;
}

export async function createTenant(
  payload: CreateTenantPayload,
): Promise<Tenant> {
  const res = await api.post<Tenant>('/platform/tenants', payload);
  return res.data;
}

export async function updateTenant(
  id: string,
  payload: UpdateTenantPayload,
): Promise<Tenant> {
  const res = await api.patch<Tenant>(`/platform/tenants/${id}`, payload);
  return res.data;
}

export async function deleteTenant(
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = await api.delete<{ success: boolean; id: string }>(
    `/platform/tenants/${id}`,
  );
  return res.data;
}
