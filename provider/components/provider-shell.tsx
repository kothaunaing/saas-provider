'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  CreditCard,
  Headphones,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useProviderState } from './provider-state';

const navigation = [
  { label: 'Overview', href: '/', icon: BarChart3 },
  { label: 'Tenants', href: '/tenants', icon: Building2 },
  { label: 'Plans', href: '/plans', icon: CreditCard },
  { label: 'Billing', href: '/billing', icon: CircleDollarSign },
  { label: 'Support', href: '/support', icon: Headphones },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function ProviderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { tickets, settings } = useProviderState();
  const openTickets = tickets.filter(
    (ticket) => ticket.status !== 'Resolved',
  ).length;
  const current =
    navigation.find((item) => item.href === pathname)?.label ??
    'Provider console';
  return (
    <div className="provider-app">
      <aside className={`provider-sidebar ${open ? 'is-open' : ''}`}>
        <div className="provider-brand">
          <span>
            <Sparkles size={18} />
          </span>
          <div>
            <strong>{settings.platformName}</strong>
            <small>Provider console</small>
          </div>
        </div>
        <nav aria-label="Provider navigation">
          <p>PLATFORM</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'active' : ''}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === 'Support' && <b>{openTickets}</b>}
              </Link>
            );
          })}
        </nav>
        <div className="provider-sidebar-bottom">
          <div className="provider-health">
            <ShieldCheck size={17} />
            <span>
              <strong>All systems operational</strong>
              <small>Checked just now</small>
            </span>
          </div>
          <div className="provider-user">
            <span>HP</span>
            <div>
              <strong>Hlyan Phyo</strong>
              <small>Platform owner</small>
            </div>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="provider-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <main className="provider-main">
        <header className="provider-topbar">
          <button
            className="provider-menu"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div>
            <strong>{current}</strong>
            <small>Serenity Cloud administration</small>
          </div>
          <span className="provider-demo">DEMO DATA</span>
          <a className="provider-workspace-link" href="http://127.0.0.1:3000">
            Open tenant workspace ↗
          </a>
        </header>
        {settings.maintenanceMode && (
          <div className="provider-maintenance">
            Maintenance mode is enabled. New bookings are temporarily paused.
          </div>
        )}
        <div className="provider-content">{children}</div>
      </main>
    </div>
  );
}
