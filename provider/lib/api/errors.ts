import { api } from "./client";
export type SystemError = {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  message: string;
  stack: string | null;
  status: "OPEN" | "RESOLVED";
  occurredAt: string;
  resolvedAt: string | null;
  tenant: { id: string; name: string; slug: string } | null;
};
export const getSystemErrors = async (status?: "OPEN" | "RESOLVED") =>
  (
    await api.get<SystemError[]>("/platform/errors", {
      params: status ? { status } : {},
    })
  ).data;
export const resolveSystemError = async (id: string) =>
  (await api.patch<SystemError>(`/platform/errors/${id}/resolve`)).data;
