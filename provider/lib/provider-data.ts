export type TenantStatus = 'Active' | 'Trial' | 'Pending' | 'Suspended';
export type Tenant = {
  id: string;
  name: string;
  owner: string;
  email: string;
  city: string;
  plan: string;
  status: TenantStatus;
  joined: string;
  locations: number;
  staff: number;
  bookings: number;
  mrr: number;
  lastActive: string;
};
export type Plan = {
  id: string;
  name: string;
  price: number;
  interval: 'month';
  tenantLimit: number | null;
  staffLimit: number | null;
  features: string[];
  active: boolean;
};
export type Invoice = {
  id: string;
  tenantId: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Due' | 'Failed' | 'Refunded';
  plan: string;
};
export type Ticket = {
  id: string;
  tenantId: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: 'Open' | 'In progress' | 'Waiting' | 'Resolved';
  created: string;
  message: string;
};
export type ProviderSettings = {
  platformName: string;
  supportEmail: string;
  trialDays: number;
  tenantApproval: boolean;
  maintenanceMode: boolean;
  incidentEmails: boolean;
  billingEmails: boolean;
};

export const initialTenants: Tenant[] = [
  {
    id: 'tn-serenity',
    name: 'Serenity Spa & Salon',
    owner: 'Nandar Aye',
    email: 'owner@serenity.com',
    city: 'Yangon',
    plan: 'Pro',
    status: 'Active',
    joined: '2025-06-13',
    locations: 1,
    staff: 6,
    bookings: 184,
    mrr: 49,
    lastActive: '2 min ago',
  },
  {
    id: 'tn-lotus',
    name: 'Lotus Beauty Lounge',
    owner: 'Nilar Win',
    email: 'hello@lotus.example',
    city: 'Yangon',
    plan: 'Starter',
    status: 'Trial',
    joined: '2026-07-22',
    locations: 1,
    staff: 3,
    bookings: 61,
    mrr: 0,
    lastActive: '18 min ago',
  },
  {
    id: 'tn-aurora',
    name: 'Aurora Wellness Studio',
    owner: 'Khin Thiri',
    email: 'khin@aurora.example',
    city: 'Mandalay',
    plan: 'Business',
    status: 'Active',
    joined: '2025-11-04',
    locations: 3,
    staff: 24,
    bookings: 496,
    mrr: 99,
    lastActive: '6 min ago',
  },
  {
    id: 'tn-orchid',
    name: 'Orchid Hair House',
    owner: 'Moe Sandi',
    email: 'moe@orchid.example',
    city: 'Naypyidaw',
    plan: 'Pro',
    status: 'Pending',
    joined: '2026-08-06',
    locations: 1,
    staff: 5,
    bookings: 0,
    mrr: 0,
    lastActive: '1 hr ago',
  },
  {
    id: 'tn-glow',
    name: 'Glow & Co.',
    owner: 'Pyae Sone',
    email: 'team@glow.example',
    city: 'Yangon',
    plan: 'Pro',
    status: 'Active',
    joined: '2026-02-18',
    locations: 2,
    staff: 11,
    bookings: 278,
    mrr: 49,
    lastActive: '32 min ago',
  },
  {
    id: 'tn-muse',
    name: 'Muse Nail Atelier',
    owner: 'Chaw Su',
    email: 'chaw@muse.example',
    city: 'Mandalay',
    plan: 'Starter',
    status: 'Suspended',
    joined: '2025-09-08',
    locations: 1,
    staff: 4,
    bookings: 39,
    mrr: 0,
    lastActive: '12 days ago',
  },
  {
    id: 'tn-bloom',
    name: 'Bloom Day Spa',
    owner: 'Thuzar Win',
    email: 'hello@bloom.example',
    city: 'Taunggyi',
    plan: 'Business',
    status: 'Active',
    joined: '2025-03-25',
    locations: 2,
    staff: 18,
    bookings: 357,
    mrr: 99,
    lastActive: '4 min ago',
  },
  {
    id: 'tn-moon',
    name: 'Moonlight Massage',
    owner: 'Htet Naing',
    email: 'htet@moonlight.example',
    city: 'Yangon',
    plan: 'Starter',
    status: 'Active',
    joined: '2026-05-14',
    locations: 1,
    staff: 4,
    bookings: 83,
    mrr: 19,
    lastActive: '48 min ago',
  },
];

export const initialPlans: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    price: 19,
    interval: 'month',
    tenantLimit: 1,
    staffLimit: 3,
    features: ['Appointments', 'Customer CRM', 'Basic reports'],
    active: true,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    price: 49,
    interval: 'month',
    tenantLimit: 2,
    staffLimit: 10,
    features: [
      'Everything in Starter',
      'Loyalty & rewards',
      'Advanced analytics',
    ],
    active: true,
  },
  {
    id: 'plan-business',
    name: 'Business',
    price: 99,
    interval: 'month',
    tenantLimit: null,
    staffLimit: null,
    features: ['Everything in Pro', 'Multiple locations', 'Priority support'],
    active: true,
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: 'INV-2608-1042',
    tenantId: 'tn-serenity',
    date: '2026-08-01',
    amount: 49,
    status: 'Paid',
    plan: 'Pro',
  },
  {
    id: 'INV-2608-1041',
    tenantId: 'tn-aurora',
    date: '2026-08-01',
    amount: 99,
    status: 'Paid',
    plan: 'Business',
  },
  {
    id: 'INV-2608-1040',
    tenantId: 'tn-glow',
    date: '2026-08-01',
    amount: 49,
    status: 'Due',
    plan: 'Pro',
  },
  {
    id: 'INV-2608-1039',
    tenantId: 'tn-bloom',
    date: '2026-08-01',
    amount: 99,
    status: 'Paid',
    plan: 'Business',
  },
  {
    id: 'INV-2608-1038',
    tenantId: 'tn-moon',
    date: '2026-08-01',
    amount: 19,
    status: 'Failed',
    plan: 'Starter',
  },
  {
    id: 'INV-2607-0987',
    tenantId: 'tn-serenity',
    date: '2026-07-01',
    amount: 49,
    status: 'Paid',
    plan: 'Pro',
  },
  {
    id: 'INV-2607-0986',
    tenantId: 'tn-aurora',
    date: '2026-07-01',
    amount: 99,
    status: 'Refunded',
    plan: 'Business',
  },
];

export const initialTickets: Ticket[] = [
  {
    id: 'SUP-2481',
    tenantId: 'tn-lotus',
    subject: 'Calendar availability does not refresh',
    category: 'Bookings',
    priority: 'High',
    status: 'Open',
    created: '2026-08-07T08:24:00',
    message:
      'A cancelled appointment still appears unavailable for one staff member. We refreshed twice and can still reproduce it.',
  },
  {
    id: 'SUP-2479',
    tenantId: 'tn-glow',
    subject: 'Need a copy of July invoice',
    category: 'Billing',
    priority: 'Normal',
    status: 'In progress',
    created: '2026-08-07T06:18:00',
    message:
      'Could you send our July invoice to the billing contact on the account?',
  },
  {
    id: 'SUP-2476',
    tenantId: 'tn-orchid',
    subject: 'Business verification document',
    category: 'Onboarding',
    priority: 'Normal',
    status: 'Waiting',
    created: '2026-08-06T14:02:00',
    message:
      'We uploaded our registration document. Please let us know whether anything else is needed for approval.',
  },
  {
    id: 'SUP-2468',
    tenantId: 'tn-muse',
    subject: 'Payment method declined',
    category: 'Billing',
    priority: 'Urgent',
    status: 'Open',
    created: '2026-08-05T11:45:00',
    message:
      'Our replacement card is being declined. We need access restored before weekend bookings.',
  },
  {
    id: 'SUP-2461',
    tenantId: 'tn-serenity',
    subject: 'How to add a staff break',
    category: 'How-to',
    priority: 'Low',
    status: 'Resolved',
    created: '2026-08-03T09:10:00',
    message:
      'We found the working hours panel and added the break successfully.',
  },
];

export const initialProviderSettings: ProviderSettings = {
  platformName: 'Serenity Cloud',
  supportEmail: 'support@serenitycloud.example',
  trialDays: 14,
  tenantApproval: true,
  maintenanceMode: false,
  incidentEmails: true,
  billingEmails: true,
};

export const platformTrend = [
  14200, 15800, 14900, 18100, 19700, 21300, 23800, 22600, 25900, 28100, 30400,
  32900,
];
