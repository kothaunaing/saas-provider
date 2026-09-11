'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  CreditCard,
  Headphones,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useProviderState } from './provider-state';
import { ProviderLoginPage } from './login';

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
  const { user, isLoadingUser, logoutUser, tickets, settings } =
    useProviderState();

  if (isLoadingUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#64748b',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <span>Loading Serenity Cloud…</span>
      </div>
    );
  }

  if (!user) {
    return <ProviderLoginPage />;
  }

  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status !== 'Resolved' && ticket.status !== 'RESOLVED',
  ).length;

  const current =
    navigation.find((item) => item.href === pathname)?.label ??
    'Provider console';

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="provider-app">
      <aside className={`provider-sidebar ${open ? 'is-open' : ''}`}>
        <div className="provider-brand">
          <span>
            <Sparkles size={18} />
          </span>
          <div>
            <strong>{settings.platformName}</strong>
            <small>Super Admin Console</small>
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
                {item.label === 'Support' && openTickets > 0 && (
                  <b>{openTickets}</b>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="provider-sidebar-bottom">
          <div className="provider-health">
            <ShieldCheck size={17} />
            <span>
              <strong>All systems operational</strong>
              <small>Live Cloud Engine</small>
            </span>
          </div>
          <div className="provider-user">
            <span>{userInitials || 'AD'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </strong>
              <small style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </small>
            </div>
            <button
              type="button"
              onClick={logoutUser}
              title="Sign Out"
              aria-label="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                color: '#98a2b3',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
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
            <small>Serenity Cloud Super Administration</small>
          </div>
          <span
            className="provider-demo"
            style={{
              background: '#ecfdf5',
              borderColor: '#a7f3d0',
              color: '#047857',
            }}
          >
            ● LIVE CLOUD
          </span>
          <a
            className="provider-workspace-link"
            href="http://127.0.0.1:3000"
            target="_blank"
            rel="noreferrer"
          >
            Open tenant workspace ↗
          </a>
        </header>
        {settings.maintenanceMode && (
          <div className="provider-maintenance">
            Maintenance mode is enabled. New bookings are temporarily paused across all salons.
          </div>
        )}
        <div className="provider-content">{children}</div>
      </main>
    </div>
  );
}
