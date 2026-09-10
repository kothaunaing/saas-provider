import { notFound } from 'next/navigation';
import {
  ProviderDashboard,
  type ProviderView,
} from '@/provider/components/provider-dashboard';

const views = ['tenants', 'plans', 'billing', 'support', 'settings'] as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return views.map((view) => ({ view }));
}

export default async function ProviderSection({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  if (!views.includes(view as (typeof views)[number])) notFound();
  return <ProviderDashboard view={view as ProviderView} />;
}
