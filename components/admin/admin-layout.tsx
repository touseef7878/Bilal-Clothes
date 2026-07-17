'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Ticket, Settings, LogOut, Menu, X, ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin',            label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/products',   label: 'Products',    icon: Package },
  { href: '/admin/orders',     label: 'Orders',      icon: ShoppingBag },
  { href: '/admin/customers',  label: 'Customers',   icon: Users },
  { href: '/admin/promos',     label: 'Promo Codes', icon: Ticket },
  { href: '/admin/settings',   label: 'Settings',    icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [loading,     setLoading]     = useState(true);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [adminRole,   setAdminRole]   = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/account/login?redirect=/admin'); return; }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!adminUser) { router.push('/'); return; }

      setAdminRole(adminUser.role);
      setIsAdmin(true);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading admin...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    // Root: full viewport height, no scroll on this container
    <div className="h-screen overflow-hidden bg-muted/30 flex">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      {/* Always fixed — never scrolls with content */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground',
        'flex flex-col',                          // flex column so sign-out sticks to bottom
        'transition-transform duration-200',
        'lg:translate-x-0',                       // always visible on desktop
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>

        {/* Brand + role badge */}
        <div className="px-6 py-5 border-b border-primary-foreground/10 shrink-0">
          <Link
            href="/admin"
            className="font-display text-xl font-bold leading-tight block"
            onClick={() => setSidebarOpen(false)}
          >
            Bilal Clothes
            <span className="block text-sm font-normal text-primary-foreground/60">Admin Panel</span>
          </Link>
          {adminRole && (
            <span className={cn(
              'mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize',
              adminRole === 'owner'    && 'bg-yellow-400/20 text-yellow-300',
              adminRole === 'operator' && 'bg-blue-400/20 text-blue-300',
              adminRole === 'staff'    && 'bg-gray-400/20 text-gray-300',
            )}>
              {adminRole}
            </span>
          )}
        </div>

        {/* Nav links — flex-1 pushes sign-out to bottom */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {adminNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-foreground/15 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out — always at bottom, never pushed off screen */}
        <div className="shrink-0 p-3 border-t border-primary-foreground/10">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ────────────────────────────────────────── */}
      {/* lg:pl-64 offsets content so it's never under the fixed sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 h-screen overflow-hidden">

        {/* Mobile top bar */}
        <header className="lg:hidden shrink-0 sticky top-0 z-20 bg-background border-b px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-muted"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-display text-lg font-bold">Admin</span>
          <div className="w-7" />
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
