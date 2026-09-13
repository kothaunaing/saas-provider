"use client";

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
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type Tenant,
  type Plan,
  type Invoice,
  type Ticket,
  type ProviderSettings,
  updateTenant,
  deleteTenant,
  createPlan,
  updatePlan,
  deletePlan,
  updateInvoice,
  updateTicket,
  deleteTicket,
  saveSettings,
  getSystemErrors,
  resolveSystemError,
  getHealth,
} from "@/provider/lib/api";
import { money } from "@/provider/lib/provider-utils";
import { useProviderState } from "./provider-state";

function getErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    (err as { response?: { data?: { message?: string } } }).response?.data
      ?.message
  ) {
    return String(
      (err as { response?: { data?: { message?: string } } }).response?.data
        ?.message,
    );
  }
  return fallback;
}

export const providerViews = [
  "overview",
  "tenants",

  "plans",
  "billing",
  "support",
  "settings",
  "errors",
] as const;
export type ProviderView = (typeof providerViews)[number];

const copy = {
  overview: [
    "Platform overview",
    "Monitor growth, tenant activity, and the work that needs your attention.",
  ],
  tenants: [
    "Tenant management",
    "Review every business using the platform and control access from one place.",
  ],
  plans: [
    "Plans & subscriptions",
    "Set the packages available to salons and keep limits easy to understand.",
  ],
  billing: [
    "Billing control",
    "Track subscription invoices, payment failures, and monthly collections.",
  ],
  support: [
    "Support desk",
    "Triage tenant questions and keep urgent operational issues moving.",
  ],
  settings: [
    "System settings",
    "Configure onboarding, platform communication, and maintenance controls.",
  ],
  errors: [
    "System errors",
    "Inspect application failures and resolve operational incidents.",
  ],
} satisfies Record<ProviderView, [string, string]>;

export function ProviderDashboard({ view }: { view: ProviderView }) {
  const [title, subtitle] = copy[view];
  return (
    <>
      <PageHead
        eyebrow={
          view === "overview" ? "BUSINESS CONTROL CENTER" : "SERENITY CLOUD"
        }
        title={title}
        subtitle={subtitle}
      />
      {view === "overview" && <Overview />}
      {view === "tenants" && <Tenants />}
      {view === "plans" && <Plans />}
      {view === "billing" && <Billing />}
      {view === "support" && <Support />}
      {view === "settings" && <SettingsPage />}
      {view === "errors" && <ErrorsPage />}
    </>
  );
}

function ErrorsPage() {
  const [errors, setErrors] = useState<
    Awaited<ReturnType<typeof getSystemErrors>>
  >([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useProviderState();
  useEffect(() => {
    let active = true;
    getSystemErrors()
      .then((rows) => active && setErrors(rows))
      .catch((error) =>
        notify(getErrorMessage(error, "Failed to load system errors.")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [notify]);
  async function resolve(id: string) {
    try {
      const updated = await resolveSystemError(id);
      setErrors((rows) => rows.map((row) => (row.id === id ? updated : row)));
      notify("Incident resolved.");
    } catch (error) {
      notify(getErrorMessage(error, "Failed to resolve incident."));
    }
  }
  if (loading) return <p>Loading system errors…</p>;
  return (
    <section className="provider-card">
      <div className="provider-card-head">
        <div>
          <h2>Incident log</h2>
          <p>
            {errors.filter((item) => item.status === "OPEN").length} open
            incidents
          </p>
        </div>
      </div>
      <div className="provider-ticket-list">
        {errors.map((item) => (
          <div key={item.id} className="provider-ticket-item">
            <span
              className={`provider-priority priority-${item.status === "OPEN" ? "urgent" : "normal"}`}
            >
              {item.status}
            </span>
            <div>
              <strong>
                {item.statusCode} · {item.method} {item.path}
              </strong>
              <p>
                {item.tenant?.name ?? "Platform"} ·{" "}
                {new Date(item.occurredAt).toLocaleString()} · {item.message}
              </p>
            </div>
            {item.status === "OPEN" && (
              <button
                type="button"
                className="provider-link"
                onClick={() => {
                  void resolve(item.id);
                }}
              >
                Resolve
              </button>
            )}
          </div>
        ))}
        {!errors.length && <p>No system errors recorded.</p>}
      </div>
    </section>
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
  tone = "indigo",
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
  const normalized = value.toLowerCase().replace(/\s+/g, "-");
  return (
    <span className={`provider-status status-${normalized}`}>
      <i />
      {value}
    </span>
  );
}

function Pagination({
  meta,
  onPageChange,
}: {
  meta: { total: number; page: number; size: number; totalPages: number };
  onPageChange: (newPage: number) => void;
}) {
  if (!meta || meta.total === 0) return null;
  const start = (meta.page - 1) * meta.size + 1;
  const end = Math.min(meta.page * meta.size, meta.total);

  return (
    <div className="provider-pagination">
      <div className="provider-pagination-info">
        Showing <strong>{start}</strong> to <strong>{end}</strong> of{" "}
        <strong>{meta.total}</strong> records
      </div>
      <div className="provider-pagination-actions">
        <button
          type="button"
          className="provider-page-btn"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </button>
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
          Page {meta.page} of {Math.max(1, meta.totalPages)}
        </span>
        <button
          type="button"
          className="provider-page-btn"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Overview() {
  const { analytics, tenants } = useProviderState();

  const activeTenants = analytics ? analytics.activeTenants : tenants.length;
  const mrr = analytics ? analytics.mrr : 0;
  const bookings = analytics ? analytics.bookings : 0;
  const openTickets = analytics ? analytics.openTickets : 0;

  const starter =
    analytics?.planDistribution?.find((p) => p.name.toLowerCase() === "starter")
      ?.count ?? 0;
  const pro =
    analytics?.planDistribution?.find((p) => p.name.toLowerCase() === "pro")
      ?.count ?? 0;
  const business =
    analytics?.planDistribution?.find(
      (p) => p.name.toLowerCase() === "business",
    )?.count ?? 0;
  const totalPlans =
    analytics?.planDistribution?.reduce((sum, p) => sum + p.count, 0) || 1;

  const recent =
    analytics?.recentTenants && analytics.recentTenants.length > 0
      ? analytics.recentTenants
      : tenants.slice(0, 5);

  return (
    <>
      <div className="provider-metrics">
        <Metric
          label="Active tenants"
          value={String(activeTenants)}
          note="Live businesses on platform"
          icon={Building2}
        />
        <Metric
          label="Monthly recurring revenue"
          value={money(mrr)}
          note="Platform recurring subscription total"
          icon={CircleDollarSign}
          tone="green"
        />
        <Metric
          label="Bookings total"
          value={bookings.toLocaleString()}
          note="Across all tenant workspaces"
          icon={Activity}
          tone="blue"
        />
        <Metric
          label="Open support tickets"
          value={String(openTickets)}
          note="Active support inquiries"
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
              total={totalPlans}
              color="purple"
            />
            <Mix label="Pro" count={pro} total={totalPlans} color="blue" />
            <Mix
              label="Starter"
              count={starter}
              total={totalPlans}
              color="green"
            />
          </div>
          <div className="provider-trial-box">
            <Sparkles size={18} />
            <div>
              <strong>Live Platform Health</strong>
              <span>All multi-tenant services operational</span>
            </div>
            <b>100%</b>
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
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="provider-mix">
      <div>
        <span>{label}</span>
        <b>{count} tenants</b>
      </div>
      <div>
        <i className={color} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

type TenantTableRow = {
  id: string;
  name: string;
  owner: string;
  city: string;
  plan: string;
  status: string;
  displayStatus?: string;
  joined?: string;
  staff?: number;
  bookings?: number;
  lastActive?: string;
};

function TenantTable({
  rows,
  onSelect,
}: {
  rows: (Tenant | TenantTableRow)[];
  onSelect?: (tenant: Tenant | TenantTableRow) => void;
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
              className={onSelect ? "clickable" : ""}
            >
              <td aria-label="Tenant account">
                <div className="provider-tenant-cell">
                  <span>
                    {(tenant.name || "Tenant")
                      .split(" ")
                      .map((x) => x[0])
                      .slice(0, 2)
                      .join("")}
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
                <Status value={tenant.displayStatus || tenant.status} />
              </td>
              <td>{tenant.staff ?? "—"}</td>
              <td>{tenant.bookings ?? "—"}</td>
              <td>{tenant.lastActive ?? "Recently"}</td>
              <td>
                <ChevronRight size={16} />
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={7}
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "var(--muted)",
                }}
              >
                No tenants found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Tenants() {
  const {
    tenants,
    tenantsMeta,
    tenantsQuery,
    setTenantsQuery,
    refreshTenants,
    refreshAnalytics,
    notify,
  } = useProviderState();

  const [searchInput, setSearchInput] = useState(tenantsQuery.search ?? "");
  const [selected, setSelected] = useState<Tenant | null>(null);

  // Debounce search input to server query
  useEffect(() => {
    const timer = setTimeout(() => {
      setTenantsQuery((prev) => {
        if (prev.search === (searchInput || undefined)) return prev;
        return { ...prev, search: searchInput || undefined, page: 1 };
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, setTenantsQuery]);

  function handleFilterClick(statusFilter: string) {
    const mapped =
      statusFilter === "All" ? undefined : statusFilter.toUpperCase();
    setTenantsQuery((prev) => ({ ...prev, status: mapped, page: 1 }));
  }

  async function changeStatus(tenant: Tenant, status: string) {
    try {
      await updateTenant(tenant.id, { status: status.toUpperCase() });
      notify(`${tenant.name} is now ${status.toLowerCase()}.`);
      setSelected(null);
      await Promise.all([refreshTenants(), refreshAnalytics()]);
    } catch (err: unknown) {
      notify(getErrorMessage(err, "Failed to update tenant status."));
    }
  }

  async function removeTenant(tenant: Tenant) {
    if (
      window.confirm(`Permanently remove ${tenant.name} from the platform?`)
    ) {
      try {
        await deleteTenant(tenant.id);
        setSelected(null);
        notify(`${tenant.name} was removed.`);
        await Promise.all([refreshTenants(), refreshAnalytics()]);
      } catch (err: unknown) {
        notify(getErrorMessage(err, "Failed to delete tenant."));
      }
    }
  }

  const currentFilter = !tenantsQuery.status
    ? "All"
    : tenantsQuery.status.charAt(0) +
      tenantsQuery.status.slice(1).toLowerCase();

  return (
    <>
      <div className="provider-toolbar">
        <label className="provider-search">
          <Search size={17} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tenants by name, owner, or email"
          />
        </label>
        <div className="provider-filters">
          {["All", "Active", "Trial", "Pending", "Suspended"].map((item) => (
            <button
              className={currentFilter === item ? "active" : ""}
              key={item}
              onClick={() => handleFilterClick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <section className="provider-card provider-table-card">
        <div className="provider-card-head">
          <div>
            <h2>All tenants</h2>
            <p>
              Showing {tenants.length} of {tenantsMeta.total} accounts
            </p>
          </div>
        </div>
        <TenantTable
          rows={tenants}
          onSelect={(item) => setSelected(item as Tenant)}
        />
        <Pagination
          meta={tenantsMeta}
          onPageChange={(page) =>
            setTenantsQuery((prev) => ({ ...prev, page }))
          }
        />
      </section>

      {/* Tenant Details Drawer */}
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
            <Status value={selected.displayStatus || selected.status} />
            <div className="provider-detail-grid">
              <Detail label="Owner" value={selected.owner} />
              <Detail label="Email" value={selected.email} />
              <Detail label="Plan" value={selected.plan} />
              <Detail label="Locations" value={String(selected.locations)} />
              <Detail label="Staff members" value={String(selected.staff)} />
              <Detail label="Bookings" value={String(selected.bookings)} />
            </div>
            <div className="provider-drawer-actions">
              {(selected.status === "PENDING" ||
                selected.status === "Pending") && (
                <button
                  className="provider-primary"
                  onClick={() => changeStatus(selected, "Active")}
                >
                  <Check size={17} /> Approve tenant
                </button>
              )}
              {selected.status === "SUSPENDED" ||
              selected.status === "Suspended" ? (
                <button
                  className="provider-primary"
                  onClick={() => changeStatus(selected, "Active")}
                >
                  Reactivate account
                </button>
              ) : (
                selected.status !== "PENDING" &&
                selected.status !== "Pending" && (
                  <button
                    className="provider-secondary"
                    onClick={() => changeStatus(selected, "Suspended")}
                  >
                    Suspend account
                  </button>
                )
              )}
              <button
                className="provider-danger"
                onClick={() => removeTenant(selected)}
              >
                Delete tenant
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
  const { plans, refreshPlans, refreshAnalytics, tenants, notify } =
    useProviderState();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 49,
    staffLimit: 10 as number | null,
    featuresText:
      "Online appointment booking\nStaff schedule sync\nLoyalty program engine",
  });

  async function save(plan: Plan) {
    try {
      await updatePlan(plan.id, {
        price: plan.price,
        staffLimit: plan.staffLimit ?? undefined,
        active: plan.active,
      });
      setEditing(null);
      notify(`${plan.name} plan updated.`);
      await Promise.all([refreshPlans(), refreshAnalytics()]);
    } catch (err: unknown) {
      notify(getErrorMessage(err, "Failed to update plan."));
    }
  }

  async function handleCreatePlan(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!newPlan.name) {
      notify("Plan name is required.");
      return;
    }
    try {
      const features = newPlan.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);
      await createPlan({
        name: newPlan.name,
        price: Number(newPlan.price),
        interval: "month",
        staffLimit: newPlan.staffLimit ? Number(newPlan.staffLimit) : undefined,
        features,
        active: true,
      });
      setIsCreating(false);
      setNewPlan({
        name: "",
        price: 49,
        staffLimit: 10,
        featuresText:
          "Online appointment booking\nStaff schedule sync\nLoyalty program engine",
      });
      notify(`Plan "${newPlan.name}" created successfully.`);
      await Promise.all([refreshPlans(), refreshAnalytics()]);
    } catch (err: unknown) {
      notify(getErrorMessage(err, "Failed to create plan."));
    }
  }

  async function handleDeletePlan(planId: string, name: string) {
    if (!window.confirm(`Delete plan "${name}"?`)) return;
    try {
      await deletePlan(planId);
      setEditing(null);
      notify(`Plan "${name}" deleted.`);
      await Promise.all([refreshPlans(), refreshAnalytics()]);
    } catch (err: unknown) {
      notify(getErrorMessage(err, "Failed to delete plan."));
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}
      >
        <button
          className="provider-primary"
          onClick={() => setIsCreating(true)}
        >
          <Plus size={17} /> Create plan
        </button>
      </div>

      <div className="provider-plan-cards">
        {plans.map((plan) => (
          <article
            className={`provider-plan-card ${plan.name === "Pro" ? "featured" : ""}`}
            key={plan.id}
          >
            {plan.name === "Pro" && (
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
              <Status value={plan.active ? "Active" : "Inactive"} />
            </div>
            <p>
              {plan.staffLimit
                ? `Up to ${plan.staffLimit} staff members`
                : "Unlimited staff and locations"}
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
                {plan.tenantCount ??
                  tenants.filter((tenant) => tenant.plan === plan.name)
                    .length}{" "}
                tenants
              </span>
              <button onClick={() => setEditing({ ...plan })}>
                Edit plan <ChevronRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Edit Plan Modal */}
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
              void save(editing);
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
            <p>Changes take effect immediately across Serenity Cloud.</p>
            <label>
              Monthly price ($)
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
                value={editing.staffLimit ?? ""}
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
              />{" "}
              Available for new subscriptions
            </label>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                className="provider-primary"
                type="submit"
                style={{ flex: 1 }}
              >
                Save changes
              </button>
              <button
                type="button"
                className="provider-danger"
                onClick={() => handleDeletePlan(editing.id, editing.name)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </form>
        </dialog>
      )}

      {/* Create Plan Modal */}
      {isCreating && (
        <dialog open className="provider-modal-layer" aria-label="Create Plan">
          <button
            className="provider-drawer-scrim"
            onClick={() => setIsCreating(false)}
            aria-label="Close dialog"
          />
          <form className="provider-modal" onSubmit={handleCreatePlan}>
            <button
              type="button"
              className="provider-drawer-close"
              onClick={() => setIsCreating(false)}
            >
              <X size={18} />
              <span className="sr-only">Close</span>
            </button>
            <h2>New Subscription Tier</h2>
            <p>Create a subscription package for prospective salons & spas.</p>
            <label>
              Tier Name *
              <input
                required
                placeholder="e.g. Enterprise"
                value={newPlan.name}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, name: e.target.value })
                }
              />
            </label>
            <label>
              Monthly Price ($) *
              <input
                type="number"
                min="0"
                required
                value={newPlan.price}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, price: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Staff Limit
              <input
                type="number"
                min="1"
                placeholder="Leave blank for unlimited"
                value={newPlan.staffLimit ?? ""}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    staffLimit: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </label>
            <label>
              Features (one per line)
              <textarea
                rows={4}
                value={newPlan.featuresText}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, featuresText: e.target.value })
                }
              />
            </label>
            <button
              className="provider-primary"
              type="submit"
              style={{ marginTop: "12px" }}
            >
              Create Tier
            </button>
          </form>
        </dialog>
      )}
    </>
  );
}

function Billing() {
  const {
    invoices,
    invoicesMeta,
    invoicesQuery,
    setInvoicesQuery,
    refreshInvoices,
    analytics,
    notify,
  } = useProviderState();

  const [searchInput, setSearchInput] = useState(invoicesQuery.search ?? "");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoicesQuery((prev) => {
        if (prev.search === (searchInput || undefined)) return prev;
        return { ...prev, search: searchInput || undefined, page: 1 };
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, setInvoicesQuery]);

  const paidTotal = invoices
    .filter((i) => i.status === "PAID" || i.status === "Paid")
    .reduce((s, i) => s + i.amount, 0);

  const outstandingTotal = invoices
    .filter(
      (i) =>
        i.status === "DUE" ||
        i.status === "Due" ||
        i.status === "FAILED" ||
        i.status === "Failed",
    )
    .reduce((s, i) => s + i.amount, 0);

  const failedCount = invoices.filter(
    (i) => i.status === "FAILED" || i.status === "Failed",
  ).length;

  function handleFilterClick(statusFilter: string) {
    const mapped =
      statusFilter === "All" ? undefined : statusFilter.toUpperCase();
    setInvoicesQuery((prev) => ({ ...prev, status: mapped, page: 1 }));
  }

  async function handleStatusChange(invoice: Invoice, newStatus: string) {
    try {
      await updateInvoice(invoice.id, newStatus.toUpperCase());
      notify(`Invoice ${invoice.id} marked as ${newStatus}.`);
      await refreshInvoices();
    } catch (err: unknown) {
      notify(getErrorMessage(err, "Failed to update invoice."));
    }
  }

  function exportCsv() {
    const csv = [
      "Invoice,Tenant,Date,Plan,Amount,Status",
      ...invoices.map(
        (i) =>
          `${i.id},${i.tenant},${i.date},${i.plan},${i.amount},${i.status}`,
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "serenity-invoices.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    notify("Invoice CSV exported.");
  }

  const currentFilter = !invoicesQuery.status
    ? "All"
    : invoicesQuery.status.charAt(0) +
      invoicesQuery.status.slice(1).toLowerCase();

  return (
    <>
      <div className="provider-metrics provider-three">
        <Metric
          label="Collected"
          value={money(analytics?.collected ?? paidTotal)}
          note="Gross revenue collected"
          icon={CircleDollarSign}
          tone="green"
        />
        <Metric
          label="Outstanding"
          value={money(outstandingTotal)}
          note="Due and pending invoices"
          icon={Clock3}
          tone="orange"
        />
        <Metric
          label="Failed payments"
          value={String(failedCount)}
          note="Needs salon follow-up"
          icon={Activity}
          tone="red"
        />
      </div>

      <div className="provider-toolbar">
        <label className="provider-search">
          <Search size={17} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search invoices by ID or salon name"
          />
        </label>
        <div className="provider-filters">
          {["All", "Paid", "Due", "Failed", "Refunded"].map((item) => (
            <button
              className={currentFilter === item ? "active" : ""}
              onClick={() => handleFilterClick(item)}
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
            <p>
              Showing {invoices.length} of {invoicesMeta.total} records
            </p>
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
                <th aria-label="Action">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.id}</strong>
                  </td>
                  <td>{invoice.tenant}</td>
                  <td>{invoice.date}</td>
                  <td>{invoice.plan}</td>
                  <td>{money(invoice.amount)}</td>
                  <td>
                    <Status value={invoice.displayStatus || invoice.status} />
                  </td>
                  <td>
                    <select
                      aria-label="Change invoice status"
                      value={invoice.status.toUpperCase()}
                      onChange={(e) =>
                        handleStatusChange(invoice, e.target.value)
                      }
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        borderRadius: "6px",
                        border: "1px solid #d0d5dd",
                      }}
                    >
                      <option value="PAID">Paid</option>
                      <option value="DUE">Due</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "var(--muted)",
                    }}
                  >
                    No invoices match your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          meta={invoicesMeta}
          onPageChange={(page) =>
            setInvoicesQuery((prev) => ({ ...prev, page }))
          }
        />
      </section>
    </>
  );
}

function Support() {
  const {
    tickets,
    ticketsMeta,
    ticketsQuery,
    setTicketsQuery,
    refreshTickets,
    refreshAnalytics,
    notify,
  } = useProviderState();

  const [searchInput, setSearchInput] = useState(ticketsQuery.search ?? "");
  const [selected, setSelected] = useState<Ticket | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setTicketsQuery((prev) => {
        if (prev.search === (searchInput || undefined)) return prev;
        return { ...prev, search: searchInput || undefined, page: 1 };
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, setTicketsQuery]);

  function handleFilterClick(statusFilter: string) {
    let mapped: string | undefined = undefined;
    if (statusFilter === "Open") mapped = "OPEN";
    else if (statusFilter === "In progress") mapped = "IN_PROGRESS";
    else if (statusFilter === "Waiting") mapped = "WAITING";
    else if (statusFilter === "Resolved") mapped = "RESOLVED";
    setTicketsQuery((prev) => ({ ...prev, status: mapped, page: 1 }));
  }

  async function updateStatus(newStatus: string) {
    if (!selected) return;
    try {
      const enumVal = newStatus.replace(/\s+/g, "_").toUpperCase();
      await updateTicket(selected.id, { status: enumVal });
      setSelected({ ...selected, status: newStatus, displayStatus: newStatus });
      notify(`${selected.id} status updated to ${newStatus.toLowerCase()}.`);
      await Promise.all([refreshTickets(), refreshAnalytics()]);
    } catch (err: unknown) {
      notify(getErrorMessage(err, "Failed to update ticket."));
    }
  }

  async function removeTicket(ticketId: string) {
    if (!window.confirm("Delete this support ticket?")) return;
    try {
      await deleteTicket(ticketId);
      setSelected(null);
      notify("Ticket deleted.");
      await Promise.all([refreshTickets(), refreshAnalytics()]);
    } catch (err: unknown) {
      notify(getErrorMessage(err, "Failed to delete ticket."));
    }
  }

  const currentFilter = !ticketsQuery.status
    ? "All"
    : ticketsQuery.status === "OPEN"
      ? "Open"
      : ticketsQuery.status === "IN_PROGRESS"
        ? "In progress"
        : ticketsQuery.status === "WAITING"
          ? "Waiting"
          : ticketsQuery.status === "RESOLVED"
            ? "Resolved"
            : "All";

  return (
    <>
      <div className="provider-toolbar">
        <label className="provider-search">
          <Search size={17} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tickets by subject, category, or salon"
          />
        </label>
        <div className="provider-filters">
          {["Open", "In progress", "Waiting", "Resolved", "All"].map((item) => (
            <button
              className={currentFilter === item ? "active" : ""}
              onClick={() => handleFilterClick(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="provider-ticket-list">
        {tickets.map((ticket) => (
          <button key={ticket.id} onClick={() => setSelected(ticket)}>
            <span
              className={`provider-priority priority-${ticket.priority.toLowerCase()}`}
            >
              {ticket.displayPriority || ticket.priority}
            </span>
            <div>
              <strong>{ticket.subject}</strong>
              <p>
                {ticket.id} · {ticket.tenant} · {ticket.category}
              </p>
            </div>
            <Status value={ticket.displayStatus || ticket.status} />
            <ChevronRight size={17} />
          </button>
        ))}
        {tickets.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px",
              color: "var(--muted)",
            }}
          >
            No tickets found in this queue.
          </div>
        )}
      </div>

      <Pagination
        meta={ticketsMeta}
        onPageChange={(page) => setTicketsQuery((prev) => ({ ...prev, page }))}
      />

      {/* Ticket Details Drawer */}
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
              {selected.displayPriority || selected.priority}
            </span>
            <h2>{selected.subject}</h2>
            <p>
              {selected.id} · {selected.tenant} · {selected.category}
            </p>
            <div className="provider-message">{selected.message}</div>
            <label>
              Update Ticket Status
              <select
                value={selected.status}
                onChange={(e) => updateStatus(e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In progress">In progress</option>
                <option value="Waiting">Waiting</option>
                <option value="Resolved">Resolved</option>
              </select>
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "16px",
              }}
            >
              <button
                className="provider-primary"
                onClick={() => updateStatus("Resolved")}
              >
                <Check size={17} /> Mark as Resolved
              </button>
              <button
                className="provider-danger"
                onClick={() => removeTicket(selected.id)}
              >
                Delete Ticket
              </button>
            </div>
          </aside>
        </dialog>
      )}
    </>
  );
}

function SettingsPage() {
  const { settings, setSettings, notify } = useProviderState();

  async function handleSaveSettings(draft: ProviderSettings) {
    const saved = await saveSettings(draft);
    setSettings(saved);
    notify("Platform settings saved to cloud database.");
  }

  return (
    <div className="provider-settings-grid">
      <SettingsForm
        key={`${settings.platformName}-${settings.trialDays}-${settings.supportEmail}`}
        initialSettings={settings}
        onSave={handleSaveSettings}
        notify={notify}
      />
      <HealthPanel />
    </div>
  );
}

function HealthPanel() {
  const [health, setHealth] = useState<{
    status: string;
    timestamp: string;
  } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setFailed(true));
  }, []);
  return (
    <section className="provider-card provider-system">
      <div className="provider-card-head">
        <div>
          <h2>System health</h2>
          <p>Live API status</p>
        </div>
        <ShieldCheck size={22} />
      </div>
      <div>
        <span>
          <i />
          Backend API
        </span>
        <strong>
          {failed ? "Unavailable" : (health?.status ?? "Checking…")}
        </strong>
      </div>
      {health && (
        <p>Last checked {new Date(health.timestamp).toLocaleString()}</p>
      )}
    </section>
  );
}

function SettingsForm({
  initialSettings,
  onSave,
  notify,
}: {
  initialSettings: ProviderSettings;
  onSave: (draft: ProviderSettings) => Promise<void>;
  notify: (msg: string) => void;
}) {
  const [draft, setDraft] = useState<ProviderSettings>({ ...initialSettings });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(draft);
    } catch (err: unknown) {
      notify(getErrorMessage(err, "Failed to save settings."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="provider-card provider-settings" onSubmit={handleSubmit}>
      <div className="provider-card-head">
        <div>
          <h2>Platform configuration</h2>
          <p>Persisted global settings for all tenants & automated jobs.</p>
        </div>
      </div>
      <label>
        Platform name
        <input
          value={draft.platformName}
          onChange={(e) => setDraft({ ...draft, platformName: e.target.value })}
        />
      </label>
      <label>
        Support email
        <input
          type="email"
          value={draft.supportEmail}
          onChange={(e) => setDraft({ ...draft, supportEmail: e.target.value })}
        />
      </label>
      <label>
        Default trial length (days)
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
        note="Review every new business registration before activating workspace."
        checked={draft.tenantApproval}
        onChange={(value) => setDraft({ ...draft, tenantApproval: value })}
      />
      <Toggle
        label="Maintenance mode"
        note="Pause customer bookings across every salon workspace."
        checked={draft.maintenanceMode}
        onChange={(value) => setDraft({ ...draft, maintenanceMode: value })}
      />
      <Toggle
        label="Incident email alerts"
        note="Email platform administrators when any background queue fails."
        checked={draft.incidentEmails}
        onChange={(value) => setDraft({ ...draft, incidentEmails: value })}
      />
      <Toggle
        label="Automated billing reminders"
        note="Automatically dispatch invoice notices prior to billing date."
        checked={draft.billingEmails}
        onChange={(value) => setDraft({ ...draft, billingEmails: value })}
      />
      <button className="provider-primary" type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save settings"}
      </button>
    </form>
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
