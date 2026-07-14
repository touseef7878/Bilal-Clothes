import { AdminLayout } from '@/components/admin/admin-layout';

export const metadata = {
  title: 'Admin Dashboard — Bilal Clothes',
};

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
