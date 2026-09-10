'use client';

import {
  Activity,
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Headphones,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type {
  Plan,
  Tenant,
  TenantStatus,
  Ticket,
} from '@/provider/lib/provider-data';
import { getProviderMetrics, money } from '@/provider/lib/provider-utils';
import { useProviderState } from './provider-state';

export const providerViews = [
  'overview',
  'tenants',
  'plans',
  'billing',
  'support',
  'settings',
] as const;
export type ProviderView = (typeof providerViews)[number];

const copy = {
  overview: [
    'Platform overview',
    'Monitor growth, tenant activity, and the work that needs your attention.',
  ],
  tenants: [
    'Tenant management',
    'Review every business using the platform and control access from one place.',
  ],
  plans: [
    'Plans & subscriptions',
    'Set the packages available to salons and keep limits easy to understand.',
  ],
  billing: [
    'Billing control',
    'Track subscription invoices, payment failures, and monthly collections.',
  ],
  support: [
    'Support desk',
    'Triage tenant questions and keep urgent operational issues moving.',
  ],
  settings: [
    'System settings',
    'Configure onboarding, platform communication, and maintenance controls.',
  ],
} satisfies Record<ProviderView, [string, string]>;

export function ProviderDashboard({ view }: { view: ProviderView }) {
  const [title, subtitle] = copy[view];
  return (
    <>
      <PageHead
        eyebrow={
          view === 'overview' ? 'BUSINESS CONTROL CENTER' : 'SERENITY CLOUD'
        }
        title={title}
        subtitle={subtitle}
      />
      {view === 'overview' && <Overview />}
      {view === 'tenants' && <Tenants />}
      {view === 'plans' && <Plans />}
      {view === 'billing' && <Billing />}
      {view === 'support' && <Support />}
      {view === 'settings' && <SettingsPage />}
    </>
  );
}

function PageHead({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="provider-page-head">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </section>
  );
}

function Metric({
  label,
  value,
  note,
  icon: Icon,
  tone = 'indigo',
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Activity;
  tone?: string;
}) {
  return (
    <article className="provider-metric">
      <div className={`provider-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span
      className={`provider-status status-${value.toLowerCase().replace(' ', '-')}`}
    >
      <i />
      {value}
    </span>
  );
}

function Overview() {
  const { tenants, invoices, tickets } = useProviderState();
  const metrics = getProviderMetrics(tenants, invoices, tickets);
  const recent = tenants.slice(0, 5);
  const starter = tenants.filter((t) => t.plan === 'Starter').length;
  const pro = tenants.filter((t) => t.plan === 'Pro').length;
  const business = tenants.filter((t) => t.plan === 'Business').length;
  return (
    <>
      <div className="provider-metrics">
        <Metric
          label="Active tenants"
          value={String(metrics.activeTenants)}
          note="2 joined this month"
          icon={Building2}
        />
        <Metric
          label="Monthly recurring revenue"
          value={money(metrics.mrr)}
          note="↗ 12.4% from last month"
          icon={CircleDollarSign}
          tone="green"
        />
        <Metric
          label="Bookings this month"
          value={metrics.bookings.toLocaleString()}
          note="Across all workspaces"
          icon={Activity}
          tone="blue"
        />
        <Metric
          label="Open support tickets"
          value={String(metrics.openTickets)}
          note="1 urgent ticket"
          icon={Headphones}
          tone="orange"
        />
      </div>
      <div className="provider-grid provider-overview-grid">
        <section className="provider-card provider-chart-card">
          <div className="provider-card-head">
            <div>
              <h2>Platform booking volume</h2>
              <p>Completed and upcoming bookings across all tenants</p>
            </div>
            <span>Last 12 months</span>
          </div>
          <div className="provider-chart">
            <div className="provider-y-labels">
              <span>36k</span>
              <span>24k</span>
              <span>12k</span>
              <span>0</span>
            </div>
            <svg
              viewBox="0 0 800 240"
              preserveAspectRatio="none"
              aria-label="Booking volume increased during the last 12 months"
            >
              <defs>
                <linearGradient id="provider-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#635bff" stopOpacity=".25" />
                  <stop offset="1" stopColor="#635bff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="area"
                d="M0 178 L72 158 L145 168 L218 137 L291 124 L364 110 L436 89 L509 99 L582 73 L655 54 L727 38 L800 22 L800 240 L0 240 Z"
              />
              <path
                className="line"
                d="M0 178 L72 158 L145 168 L218 137 L291 124 L364 110 L436 89 L509 99 L582 73 L655 54 L727 38 L800 22"
              />
            </svg>
            <div className="provider-months">
              <span>Sep</span>
              <span>Nov</span>
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Aug</span>
            </div>
          </div>
        </section>
        <section className="provider-card">
          <div className="provider-card-head">
            <div>
              <h2>Subscription mix</h2>
              <p>Current tenant distribution</p>
            </div>
          </div>
          <div className="provider-plan-mix">
            <Mix
              label="Business"
              count={business}
              total={tenants.length}
              color="purple"
            />
            <Mix label="Pro" count={pro} total={tenants.length} color="blue" />
            <Mix
              label="Starter"
              count={starter}
              total={tenants.length}
              color="green"
            />
          </div>
          <div className="provider-trial-box">
            <Sparkles size={18} />
            <div>
              <strong>Trial conversion</strong>
              <span>68% of trials upgrade in 14 days</span>
            </div>
            <b>68%</b>
          </div>
        </section>
      </div>
      <section className="provider-card provider-table-card">
        <div className="provider-card-head">
          <div>
            <h2>Recently active tenants</h2>
            <p>Live account status and current activity</p>
          </div>
          <Link href="/tenants">
            View all <ArrowUpRight size={15} />
          </Link>
        </div>
        <TenantTable rows={recent} />
      </section>
    </>
  );
}

function Mix({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  return (
    <div className="provider-mix">
      <div>
        <span>{label}</span>
        <b>{count} tenants</b>
      </div>
      <div>
        <i className={color} style={{ width: `${(count / total) * 100}%` }} />
      </div>
    </div>
  );
}

function TenantTable({
  rows,
  onSelect,
}: {
  rows: Tenant[];
  onSelect?: (tenant: Tenant) => void;
}) {
  return (
    <div className="provider-table-wrap">
      <table className="provider-table">
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Staff</th>
            <th>Bookings</th>
            <th>Last active</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tenant) => (
            <tr
              key={tenant.id}
              onClick={() => onSelect?.(tenant)}
              className={onSelect ? 'clickable' : ''}
            >
              <td aria-label="Tenant account">
                <div className="provider-tenant-cell">
                  <span>
                    {tenant.name
                      .split(' ')
                      .map((x) => x[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <div>
                    <strong>{tenant.name}</strong>
                    <small>
                      {tenant.owner} · {tenant.city}
                    </small>
                  </div>
                </div>
              </td>
              <td>{tenant.plan}</td>
              <td>
                <Status value={tenant.status} />
              </td>
              <td>{tenant.staff}</td>
              <td>{tenant.bookings}</td>
              <td>{tenant.lastActive}</td>
              <td>
                <ChevronRight size={16} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tenants() {
  const { tenants, setTenants, notify } = useProviderState();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Tenant | null>(null);
  const rows = tenants.filter(
    (tenant) =>
      (filter === 'All' || tenant.status === filter) &&
      `${tenant.name} ${tenant.owner} ${tenant.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function changeStatus(tenant: Tenant, status: TenantStatus) {
    setTenants((all) =>
      all.map((item) =>
        item.id === tenant.id
          ? {
              ...item,
              status,
              mrr:
                status === 'Active'
                  ? ({ Starter: 19, Pro: 49, Business: 99 }[item.plan] ?? 0)
                  : 0,
            }
          : item,
      ),
    );
    setSelected({ ...tenant, status });
    notify(`${tenant.name} is now ${status.toLowerCase()}.`);
  }
  function removeTenant(tenant: Tenant) {
    if (window.confirm(`Remove ${tenant.name} from this demo?`)) {
      setTenants((all) => all.filter((item) => item.id !== tenant.id));
      setSelected(null);
      notify('Tenant removed from demo data.');
    }
  }
  return (
    <>
      <div className="provider-toolbar">
        <label className="provider-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tenants, owners, or email"
          />
        </label>
        <div className="provider-filters">
          {['All', 'Active', 'Trial', 'Pending', 'Suspended'].map((item) => (
            <button
              className={filter === item ? 'active' : ''}
              key={item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          className="provider-primary"
          onClick={() => notify('Tenant invitation draft created.')}
        >
          <Plus size={17} /> Invite tenant
        </button>
      </div>
      <section className="provider-card provider-table-card">
        <div className="provider-card-head">
          <div>
            <h2>All tenants</h2>
            <p>
              {rows.length} of {tenants.length} accounts shown
            </p>
          </div>
        </div>
        <TenantTable rows={rows} onSelect={setSelected} />
      </section>
      {selected && (
        <dialog
          open
          className="provider-drawer-layer"
          aria-label="Details panel"
        >
          <button
            className="provider-drawer-scrim"
            onClick={() => setSelected(null)}
            aria-label="Close tenant details"
          />
          <aside className="provider-drawer">
            <button
              className="provider-drawer-close"
              onClick={() => setSelected(null)}
            >
              <X size={18} />
              <span className="sr-only">Close</span>
            </button>
            <span className="provider-avatar-lg">
              {selected.name.slice(0, 2).toUpperCase()}
            </span>
            <h2>{selected.name}</h2>
            <p>
              {selected.city} · Joined {selected.joined}
            </p>
            <Status value={selected.status} />
            <div className="provider-detail-grid">
              <Detail label="Owner" value={selected.owner} />
              <Detail label="Email" value={selected.email} />
              <Detail label="Plan" value={selected.plan} />
              <Detail label="Locations" value={String(selected.locations)} />
              <Detail label="Staff members" value={String(selected.staff)} />
              <Detail label="Bookings" value={String(selected.bookings)} />
            </div>
            <div className="provider-drawer-actions">
              {selected.status === 'Pending' && (
                <button
                  className="provider-primary"
                  onClick={() => changeStatus(selected, 'Active')}
                >
                  <Check size={17} /> Approve tenant
                </button>
              )}
              {selected.status === 'Suspended' ? (
                <button
                  className="provider-primary"
                  onClick={() => changeStatus(selected, 'Active')}
                >
                  Reactivate account
                </button>
              ) : (
                selected.status !== 'Pending' && (
                  <button
                    className="provider-secondary"
                    onClick={() => changeStatus(selected, 'Suspended')}
                  >
                    Suspend account
                  </button>
                )
              )}
              <button
                className="provider-danger"
                onClick={() => removeTenant(selected)}
              >
                Delete demo tenant
              </button>
            </div>
          </aside>
        </dialog>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function Plans() {
  const { plans, setPlans, tenants, notify } = useProviderState();
  const [editing, setEditing] = useState<Plan | null>(null);
  function save(plan: Plan) {
    setPlans((all) => all.map((item) => (item.id === plan.id ? plan : item)));
    setEditing(null);
    notify(`${plan.name} plan updated.`);
  }
  return (
    <>
      <div className="provider-plan-cards">
        {plans.map((plan) => (
          <article
            className={`provider-plan-card ${plan.name === 'Pro' ? 'featured' : ''}`}
            key={plan.id}
          >
            {plan.name === 'Pro' && (
              <span className="provider-popular">MOST POPULAR</span>
            )}
            <div className="provider-plan-top">
              <div>
                <span>{plan.name}</span>
                <strong>
                  {money(plan.price)}
                  <small>/month</small>
                </strong>
              </div>
              <Status value={plan.active ? 'Active' : 'Inactive'} />
            </div>
            <p>
              {plan.staffLimit
                ? `Up to ${plan.staffLimit} staff members`
                : 'Unlimited staff and locations'}
            </p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="provider-plan-foot">
              <span>
                {tenants.filter((tenant) => tenant.plan === plan.name).length}{' '}
                tenants
              </span>
              <button onClick={() => setEditing({ ...plan })}>
                Edit plan <ChevronRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {editing && (
        <dialog open className="provider-modal-layer" aria-label="Plan editor">
          <button
            className="provider-drawer-scrim"
            onClick={() => setEditing(null)}
            aria-label="Close editor"
          />
          <form
            className="provider-modal"
            onSubmit={(e) => {
              e.preventDefault();
              save(editing);
            }}
          >
            <button
              type="button"
              className="provider-drawer-close"
              onClick={() => setEditing(null)}
            >
              <X size={18} />
              <span className="sr-only">Close</span>
            </button>
            <h2>Edit {editing.name}</h2>
            <p>Changes apply to this demo plan immediately.</p>
            <label>
              Monthly price
              <input
                type="number"
                min="0"
                value={editing.price}
                onChange={(e) =>
                  setEditing({ ...editing, price: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Staff limit
              <input
                type="number"
                min="1"
                value={editing.staffLimit ?? ''}
                placeholder="Unlimited"
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    staffLimit: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </label>
            <label className="provider-check">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) =>
                  setEditing({ ...editing, active: e.target.checked })
                }
              />{' '}
              Available for new subscriptions
            </label>
            <button className="provider-primary" type="submit">
              Save changes
            </button>
          </form>
        </dialog>
      )}
    </>
  );
}

function Billing() {
  const { invoices, tenants, notify } = useProviderState();
  const [filter, setFilter] = useState('All');
  const rows = invoices.filter(
    (invoice) => filter === 'All' || invoice.status === filter,
  );
  const paid = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices
    .filter((i) => i.status === 'Due' || i.status === 'Failed')
    .reduce((s, i) => s + i.amount, 0);
  function exportCsv() {
    const csv = [
      'Invoice,Tenant,Date,Plan,Amount,Status',
      ...rows.map(
        (i) =>
          `${i.id},${tenants.find((t) => t.id === i.tenantId)?.name},${i.date},${i.plan},${i.amount},${i.status}`,
      ),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'serenity-invoices.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Invoice CSV exported.');
  }
  return (
    <>
      <div className="provider-metrics provider-three">
        <Metric
          label="Collected"
          value={money(paid)}
          note="Current invoice sample"
          icon={CircleDollarSign}
          tone="green"
        />
        <Metric
          label="Outstanding"
          value={money(outstanding)}
          note="Due and failed payments"
          icon={Clock3}
          tone="orange"
        />
        <Metric
          label="Failed payments"
          value={String(invoices.filter((i) => i.status === 'Failed').length)}
          note="Needs tenant follow-up"
          icon={Activity}
          tone="red"
        />
      </div>
      <div className="provider-toolbar">
        <div className="provider-filters">
          {['All', 'Paid', 'Due', 'Failed', 'Refunded'].map((item) => (
            <button
              className={filter === item ? 'active' : ''}
              onClick={() => setFilter(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <button className="provider-secondary" onClick={exportCsv}>
          <Download size={16} /> Export CSV
        </button>
      </div>
      <section className="provider-card provider-table-card">
        <div className="provider-card-head">
          <div>
            <h2>Subscription invoices</h2>
            <p>{rows.length} invoice records</p>
          </div>
        </div>
        <div className="provider-table-wrap">
          <table className="provider-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Tenant</th>
                <th>Date</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.id}</strong>
                  </td>
                  <td>
                    {tenants.find((t) => t.id === invoice.tenantId)?.name}
                  </td>
                  <td>{invoice.date}</td>
                  <td>{invoice.plan}</td>
                  <td>{money(invoice.amount)}</td>
                  <td>
                    <Status value={invoice.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Support() {
  const { tickets, setTickets, tenants, notify } = useProviderState();
  const [filter, setFilter] = useState('Open');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const rows = tickets.filter(
    (t) =>
      filter === 'All' ||
      (filter === 'Open' ? t.status !== 'Resolved' : t.status === filter),
  );
  function update(status: Ticket['status']) {
    if (!selected) return;
    setTickets((all) =>
      all.map((t) => (t.id === selected.id ? { ...t, status } : t)),
    );
    setSelected({ ...selected, status });
    notify(`${selected.id} moved to ${status.toLowerCase()}.`);
  }
  return (
    <>
      <div className="provider-toolbar">
        <div className="provider-filters">
          {['Open', 'In progress', 'Waiting', 'Resolved', 'All'].map((item) => (
            <button
              className={filter === item ? 'active' : ''}
              onClick={() => setFilter(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="provider-ticket-list">
        {rows.map((ticket) => (
          <button key={ticket.id} onClick={() => setSelected(ticket)}>
            <span
              className={`provider-priority priority-${ticket.priority.toLowerCase()}`}
            >
              {ticket.priority}
            </span>
            <div>
              <strong>{ticket.subject}</strong>
              <p>
                {ticket.id} ·{' '}
                {tenants.find((t) => t.id === ticket.tenantId)?.name} ·{' '}
                {ticket.category}
              </p>
            </div>
            <Status value={ticket.status} />
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
      {selected && (
        <dialog
          open
          className="provider-drawer-layer"
          aria-label="Details panel"
        >
          <button
            className="provider-drawer-scrim"
            onClick={() => setSelected(null)}
            aria-label="Close ticket"
          />
          <aside className="provider-drawer">
            <button
              className="provider-drawer-close"
              onClick={() => setSelected(null)}
            >
              <X size={18} />
              <span className="sr-only">Close</span>
            </button>
            <span
              className={`provider-priority priority-${selected.priority.toLowerCase()}`}
            >
              {selected.priority}
            </span>
            <h2>{selected.subject}</h2>
            <p>
              {selected.id} ·{' '}
              {tenants.find((t) => t.id === selected.tenantId)?.name}
            </p>
            <div className="provider-message">{selected.message}</div>
            <label>
              Status
              <select
                value={selected.status}
                onChange={(e) => update(e.target.value as Ticket['status'])}
              >
                <option>Open</option>
                <option>In progress</option>
                <option>Waiting</option>
                <option>Resolved</option>
              </select>
            </label>
            <button
              className="provider-primary"
              onClick={() => update('Resolved')}
            >
              <Check size={17} /> Resolve ticket
            </button>
          </aside>
        </dialog>
      )}
    </>
  );
}

function SettingsPage() {
  const { settings, setSettings, notify } = useProviderState();
  const [draft, setDraft] = useState({ ...settings });
  return (
    <div className="provider-settings-grid">
      <form
        className="provider-card provider-settings"
        onSubmit={(e) => {
          e.preventDefault();
          setSettings(draft);
          notify('Platform settings saved.');
        }}
      >
        <div className="provider-card-head">
          <div>
            <h2>Platform configuration</h2>
            <p>Changes are stored for this demo session.</p>
          </div>
        </div>
        <label>
          Platform name
          <input
            value={draft.platformName}
            onChange={(e) =>
              setDraft({ ...draft, platformName: e.target.value })
            }
          />
        </label>
        <label>
          Support email
          <input
            type="email"
            value={draft.supportEmail}
            onChange={(e) =>
              setDraft({ ...draft, supportEmail: e.target.value })
            }
          />
        </label>
        <label>
          Default trial length
          <input
            type="number"
            min="1"
            value={draft.trialDays}
            onChange={(e) =>
              setDraft({ ...draft, trialDays: Number(e.target.value) })
            }
          />
        </label>
        <Toggle
          label="Require tenant approval"
          note="Review every new business before activation."
          checked={draft.tenantApproval}
          onChange={(value) => setDraft({ ...draft, tenantApproval: value })}
        />
        <Toggle
          label="Maintenance mode"
          note="Pause customer bookings across every tenant."
          checked={draft.maintenanceMode}
          onChange={(value) => setDraft({ ...draft, maintenanceMode: value })}
        />
        <Toggle
          label="Incident email alerts"
          note="Email platform owners when a service is degraded."
          checked={draft.incidentEmails}
          onChange={(value) => setDraft({ ...draft, incidentEmails: value })}
        />
        <button className="provider-primary" type="submit">
          Save settings
        </button>
      </form>
      <section className="provider-card provider-system">
        <div className="provider-card-head">
          <div>
            <h2>System health</h2>
            <p>Live demo environment</p>
          </div>
          <ShieldCheck size={22} />
        </div>
        {[
          'Web application',
          'Booking API',
          'Email notifications',
          'Billing webhooks',
          'Database',
        ].map((service) => (
          <div key={service}>
            <span>
              <i />
              {service}
            </span>
            <strong>Operational</strong>
          </div>
        ))}
        <p>Last checked just now · 99.99% uptime</p>
      </section>
    </div>
  );
}

function Toggle({
  label,
  note,
  checked,
  onChange,
}: {
  label: string;
  note: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="provider-toggle">
      <div>
        <strong>{label}</strong>
        <small>{note}</small>
      </div>
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span />
    </div>
  );
}
