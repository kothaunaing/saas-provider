import { api, type PaginatedResult, type PaginationParams } from "./client";

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING"
  | "RESOLVED"
  | "Open"
  | "In progress"
  | "Waiting"
  | "Resolved";

export type TicketPriority =
  "LOW" | "NORMAL" | "HIGH" | "URGENT" | "Low" | "Normal" | "High" | "Urgent";

export type Ticket = {
  id: string;
  tenantId?: string;
  tenant: string;
  tenantName?: string;
  tenantEmail?: string;
  subject: string;
  category: string;
  priority: string;
  displayPriority?: string;
  status: string;
  displayStatus?: string;
  created: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface QueryTicketsParams extends PaginationParams {
  search?: string;
  status?: string;
  priority?: string;
  tenantId?: string;
}

export interface CreateTicketPayload {
  tenantId: string;
  subject: string;
  category: string;
  priority?: string;
  message: string;
}

export interface UpdateTicketPayload {
  status?: string;
  priority?: string;
}

interface RawTicketResponse {
  id: string;
  tenantId?: string;
  tenant?: string;
  tenantName?: string;
  tenantEmail?: string;
  subject: string;
  category: string;
  priority: string;
  displayPriority?: string;
  status: string;
  displayStatus?: string;
  created?: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getTickets(
  params?: QueryTicketsParams,
): Promise<PaginatedResult<Ticket>> {
  const res = await api.get<PaginatedResult<RawTicketResponse>>(
    "/platform/tickets",
    { params },
  );
  return {
    data: res.data.data.map((item) => ({
      id: item.id,
      tenantId: item.tenantId,
      tenant: item.tenantName ?? item.tenant ?? "",
      tenantName: item.tenantName,
      tenantEmail: item.tenantEmail,
      subject: item.subject,
      category: item.category,
      priority: item.priority,
      displayPriority: item.displayPriority,
      status: item.status,
      displayStatus: item.displayStatus,
      created: item.created ?? "",
      message: item.message,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    meta: res.data.meta,
  };
}

export async function createTicket(
  payload: CreateTicketPayload,
): Promise<Ticket> {
  const res = await api.post<Ticket>("/platform/tickets", payload);
  return res.data;
}

export async function updateTicket(
  id: string,
  payload: UpdateTicketPayload,
): Promise<Ticket> {
  const res = await api.patch<Ticket>(`/platform/tickets/${id}`, payload);
  return res.data;
}

export async function deleteTicket(
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = await api.delete<{ success: boolean; id: string }>(
    `/platform/tickets/${id}`,
  );
  return res.data;
}
