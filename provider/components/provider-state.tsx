'use client';

import { createContext, useContext, useState } from 'react';
import {
  initialInvoices,
  initialPlans,
  initialProviderSettings,
  initialTenants,
  initialTickets,
  type Invoice,
  type Plan,
  type ProviderSettings,
  type Tenant,
  type Ticket,
} from '@/provider/lib/provider-data';

type Context = {
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  invoices: Invoice[];
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  settings: ProviderSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProviderSettings>>;
  notice: string;
  notify: (message: string) => void;
};

const ProviderContext = createContext<Context | null>(null);

export function ProviderState({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState(initialTenants);
  const [plans, setPlans] = useState(initialPlans);
  const [invoices] = useState(initialInvoices);
  const [tickets, setTickets] = useState(initialTickets);
  const [settings, setSettings] = useState(initialProviderSettings);
  const [notice, setNotice] = useState('');
  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
  }
  return (
    <ProviderContext.Provider
      value={{
        tenants,
        setTenants,
        plans,
        setPlans,
        invoices,
        tickets,
        setTickets,
        settings,
        setSettings,
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
  if (!value) throw new Error('ProviderState is required');
  return value;
}
