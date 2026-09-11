import { api } from "./client";

export type DashboardMetrics = {
  activeTenants: number;
  totalTenants: number;
  bookings: number;
  openTickets: number;
  collected: number;
  mrr: number;
  planDistribution: Array<{
    name: string;
    count: number;
  }>;
  recentTenants: Array<{
    id: string;
    name: string;
    owner: string;
    city: string;
    plan: string;
    status: string;
    joined: string;
  }>;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await api.get<DashboardMetrics>("/platform/dashboard");
  return res.data;
}
