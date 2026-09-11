"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getMe,
  logout,
  getTenants,
  getPlans,
  getInvoices,
  getTickets,
  getSettings,
  getDashboardMetrics,
  type AuthUser,
  type Tenant,
  type Plan,
  type Invoice,
  type Ticket,
  type ProviderSettings,
  type DashboardMetrics,
  type PaginationMeta,
  type QueryTenantsParams,
  type QueryPlansParams,
  type QueryInvoicesParams,
  type QueryTicketsParams,
} from "@/provider/lib/api";

const defaultSettings: ProviderSettings = {
  platformName: "",
  supportEmail: "",
  trialDays: 0,
  tenantApproval: false,
  maintenanceMode: false,
  incidentEmails: false,
  billingEmails: false,
};

const defaultMeta: PaginationMeta = {
  total: 0,
  page: 1,
  size: 10,
  totalPages: 1,
};

type Context = {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  isLoadingUser: boolean;
  logoutUser: () => Promise<void>;

  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  tenantsMeta: PaginationMeta;
  tenantsQuery: QueryTenantsParams;
  setTenantsQuery: React.Dispatch<React.SetStateAction<QueryTenantsParams>>;
  refreshTenants: () => Promise<void>;

  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  plansMeta: PaginationMeta;
  plansQuery: QueryPlansParams;
  setPlansQuery: React.Dispatch<React.SetStateAction<QueryPlansParams>>;
  refreshPlans: () => Promise<void>;

  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  invoicesMeta: PaginationMeta;
  invoicesQuery: QueryInvoicesParams;
  setInvoicesQuery: React.Dispatch<React.SetStateAction<QueryInvoicesParams>>;
  refreshInvoices: () => Promise<void>;

  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  ticketsMeta: PaginationMeta;
  ticketsQuery: QueryTicketsParams;
  setTicketsQuery: React.Dispatch<React.SetStateAction<QueryTicketsParams>>;
  refreshTickets: () => Promise<void>;

  settings: ProviderSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProviderSettings>>;

  analytics: DashboardMetrics | null;
  refreshAnalytics: () => Promise<void>;

  notice: string;
  notify: (message: string) => void;
};

const ProviderContext = createContext<Context | null>(null);

export function ProviderState({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsMeta, setTenantsMeta] = useState<PaginationMeta>(defaultMeta);
  const [tenantsQuery, setTenantsQuery] = useState<QueryTenantsParams>({
    page: 1,
    size: 10,
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansMeta, setPlansMeta] = useState<PaginationMeta>(defaultMeta);
  const [plansQuery, setPlansQuery] = useState<QueryPlansParams>({
    page: 1,
    size: 10,
  });

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesMeta, setInvoicesMeta] = useState<PaginationMeta>(defaultMeta);
  const [invoicesQuery, setInvoicesQuery] = useState<QueryInvoicesParams>({
    page: 1,
    size: 10,
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsMeta, setTicketsMeta] = useState<PaginationMeta>(defaultMeta);
  const [ticketsQuery, setTicketsQuery] = useState<QueryTicketsParams>({
    page: 1,
    size: 10,
  });

  const [settings, setSettings] = useState<ProviderSettings>(defaultSettings);
  const [analytics, setAnalytics] = useState<DashboardMetrics | null>(null);
  const [notice, setNotice] = useState("");

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      notify("You have been signed out.");
    }
  }, []);

  // Check current session
  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const current = await getMe();
        if (mounted) {
          if (current.role === "PLATFORM_ADMIN") {
            setUser(current);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoadingUser(false);
      }
    }
    void checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  // Load tenants when query changes or user logs in
  const refreshTenants = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getTenants(tenantsQuery);
      setTenants(res.data);
      setTenantsMeta(res.meta);
    } catch {
      // fallback
    }
  }, [user, tenantsQuery]);

  useEffect(() => {
    let ignore = false;
    async function fetchTenants() {
      if (!user) return;
      try {
        const res = await getTenants(tenantsQuery);
        if (!ignore) {
          setTenants(res.data);
          setTenantsMeta(res.meta);
        }
      } catch {
        // fallback
      }
    }
    void fetchTenants();
    return () => {
      ignore = true;
    };
  }, [user, tenantsQuery]);

  // Load plans
  const refreshPlans = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getPlans(plansQuery);
      setPlans(res.data);
      setPlansMeta(res.meta);
    } catch {
      // fallback
    }
  }, [user, plansQuery]);

  useEffect(() => {
    let ignore = false;
    async function fetchPlans() {
      if (!user) return;
      try {
        const res = await getPlans(plansQuery);
        if (!ignore) {
          setPlans(res.data);
          setPlansMeta(res.meta);
        }
      } catch {
        // fallback
      }
    }
    void fetchPlans();
    return () => {
      ignore = true;
    };
  }, [user, plansQuery]);

  // Load invoices
  const refreshInvoices = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getInvoices(invoicesQuery);
      setInvoices(res.data);
      setInvoicesMeta(res.meta);
    } catch {
      // fallback
    }
  }, [user, invoicesQuery]);

  useEffect(() => {
    let ignore = false;
    async function fetchInvoices() {
      if (!user) return;
      try {
        const res = await getInvoices(invoicesQuery);
        if (!ignore) {
          setInvoices(res.data);
          setInvoicesMeta(res.meta);
        }
      } catch {
        // fallback
      }
    }
    void fetchInvoices();
    return () => {
      ignore = true;
    };
  }, [user, invoicesQuery]);

  // Load tickets
  const refreshTickets = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getTickets(ticketsQuery);
      setTickets(res.data);
      setTicketsMeta(res.meta);
    } catch {
      // fallback
    }
  }, [user, ticketsQuery]);

  useEffect(() => {
    let ignore = false;
    async function fetchTickets() {
      if (!user) return;
      try {
        const res = await getTickets(ticketsQuery);
        if (!ignore) {
          setTickets(res.data);
          setTicketsMeta(res.meta);
        }
      } catch {
        // fallback
      }
    }
    void fetchTickets();
    return () => {
      ignore = true;
    };
  }, [user, ticketsQuery]);

  // Load settings & analytics
  const refreshAnalytics = useCallback(async () => {
    if (!user) return;
    try {
      const [dash, sett] = await Promise.all([
        getDashboardMetrics(),
        getSettings(),
      ]);
      setAnalytics(dash);
      setSettings(sett);
    } catch {
      // fallback
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;
    async function fetchAnalytics() {
      if (!user) return;
      try {
        const [dash, sett] = await Promise.all([
          getDashboardMetrics(),
          getSettings(),
        ]);
        if (!ignore) {
          setAnalytics(dash);
          setSettings(sett);
        }
      } catch {
        // fallback
      }
    }
    void fetchAnalytics();
    return () => {
      ignore = true;
    };
  }, [user]);

  return (
    <ProviderContext.Provider
      value={{
        user,
        setUser,
        isLoadingUser,
        logoutUser,

        tenants,
        setTenants,
        tenantsMeta,
        tenantsQuery,
        setTenantsQuery,
        refreshTenants,

        plans,
        setPlans,
        plansMeta,
        plansQuery,
        setPlansQuery,
        refreshPlans,

        invoices,
        setInvoices,
        invoicesMeta,
        invoicesQuery,
        setInvoicesQuery,
        refreshInvoices,

        tickets,
        setTickets,
        ticketsMeta,
        ticketsQuery,
        setTicketsQuery,
        refreshTickets,

        settings,
        setSettings,

        analytics,
        refreshAnalytics,

        notice,
        notify,
      }}
    >
      {children}
      {notice && (
        <output className="provider-toast" aria-live="polite">
          {notice}
        </output>
      )}
    </ProviderContext.Provider>
  );
}

export function useProviderState() {
  const value = useContext(ProviderContext);
  if (!value) throw new Error("ProviderState is required");
  return value;
}
