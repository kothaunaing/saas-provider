import type { Invoice, Tenant, Ticket } from './provider-data';

export function getProviderMetrics(
  tenants: Tenant[],
  invoices: Invoice[],
  tickets: Ticket[],
) {
  return {
    activeTenants: tenants.filter((tenant) => tenant.status === 'Active')
      .length,
    mrr: tenants
      .filter((tenant) => tenant.status === 'Active')
      .reduce((sum, tenant) => sum + tenant.mrr, 0),
    bookings: tenants.reduce((sum, tenant) => sum + tenant.bookings, 0),
    collected: invoices
      .filter((invoice) => invoice.status === 'Paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0),
    openTickets: tickets.filter((ticket) => ticket.status !== 'Resolved')
      .length,
  };
}

export function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
