import { api, type PaginatedResult, type PaginationParams } from "./client";

export type Invoice = {
  id: string;
  tenantId?: string;
  tenant: string;
  tenantName?: string;
  tenantEmail?: string;
  plan: string;
  amount: number;
  status: string;
  displayStatus?: string;
  date: string;
  issuedAt?: string;
  createdAt?: string;
};

export interface QueryInvoicesParams extends PaginationParams {
  search?: string;
  status?: string;
  tenantId?: string;
}

interface RawInvoiceResponse {
  id: string;
  tenantId?: string;
  tenant?: string;
  tenantName?: string;
  tenantEmail?: string;
  plan?: string;
  amount?: number;
  status?: string;
  displayStatus?: string;
  date?: string;
  issuedAt?: string;
  createdAt?: string;
}

export async function getInvoices(
  params?: QueryInvoicesParams,
): Promise<PaginatedResult<Invoice>> {
  const res = await api.get<PaginatedResult<RawInvoiceResponse>>(
    "/platform/invoices",
    { params },
  );
  return {
    data: res.data.data.map((item) => ({
      id: item.id,
      tenantId: item.tenantId,
      tenant: item.tenantName ?? item.tenant ?? "",
      tenantName: item.tenantName,
      tenantEmail: item.tenantEmail,
      plan: item.plan ?? "",
      amount: Number(item.amount ?? 0),
      status: item.status ?? "DUE",
      displayStatus: item.displayStatus,
      date: item.date ?? "",
      issuedAt: item.issuedAt,
      createdAt: item.createdAt,
    })),
    meta: res.data.meta,
  };
}

export async function updateInvoice(
  id: string,
  status: string,
): Promise<Invoice> {
  const res = await api.patch<Invoice>(`/platform/invoices/${id}`, { status });
  return res.data;
}
