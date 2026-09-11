import { api, type PaginatedResult, type PaginationParams } from "./client";

export type Plan = {
  id: string;
  name: string;
  price: number;
  interval: string;
  tenantLimit: number | null;
  staffLimit: number | null;
  features: string[];
  active: boolean;
  tenantCount?: number;
};

export interface QueryPlansParams extends PaginationParams {
  search?: string;
}

export interface CreatePlanPayload {
  name: string;
  price: number;
  interval?: string;
  tenantLimit?: number;
  staffLimit?: number;
  features: string[];
  active?: boolean;
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

export async function getPlans(
  params?: QueryPlansParams,
): Promise<PaginatedResult<Plan>> {
  const res = await api.get<PaginatedResult<Plan>>("/platform/plans", {
    params,
  });
  return res.data;
}

export async function getPlan(id: string): Promise<Plan> {
  const res = await api.get<Plan>(`/platform/plans/${id}`);
  return res.data;
}

export async function createPlan(payload: CreatePlanPayload): Promise<Plan> {
  const res = await api.post<Plan>("/platform/plans", payload);
  return res.data;
}

export async function updatePlan(
  id: string,
  payload: UpdatePlanPayload,
): Promise<Plan> {
  const res = await api.patch<Plan>(`/platform/plans/${id}`, payload);
  return res.data;
}

export async function deletePlan(
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = await api.delete<{ success: boolean; id: string }>(
    `/platform/plans/${id}`,
  );
  return res.data;
}
