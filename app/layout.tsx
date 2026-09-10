import type { Metadata } from 'next';
import { ProviderShell } from '@/provider/components/provider-shell';
import { ProviderState } from '@/provider/components/provider-state';
import './globals.css';
import '@/provider/styles/provider.css';

export const metadata: Metadata = {
  title: 'Serenity Cloud | Provider console',
  description:
    'Manage tenants, subscriptions, billing, and platform operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ProviderState>
          <ProviderShell>{children}</ProviderShell>
        </ProviderState>
      </body>
    </html>
  );
}
