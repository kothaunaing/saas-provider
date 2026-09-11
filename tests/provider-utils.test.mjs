import assert from 'node:assert/strict';
import test from 'node:test';
import { getProviderMetrics } from '../provider/lib/provider-utils.ts';

test('calculates platform metrics from active tenants and paid invoices', () => {
  const tenants = [
    { status: 'Active', mrr: 49, bookings: 10 },
    { status: 'Suspended', mrr: 99, bookings: 4 },
  ];
  const invoices = [
    { status: 'Paid', amount: 49 },
    { status: 'Failed', amount: 99 },
  ];
  const tickets = [{ status: 'Open' }, { status: 'Resolved' }];
  assert.deepEqual(getProviderMetrics(tenants, invoices, tickets), {
    activeTenants: 1,
    mrr: 49,
    bookings: 14,
    collected: 49,
    openTickets: 1,
  });
});
