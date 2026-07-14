'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, ShoppingBag, Users, Ticket, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/promos', label: 'Promo Codes', icon: Ticket },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/account/login?redirect=/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
        router.push('/');
        return;
      }

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
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground transform transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6">
          <Link href="/admin" className="font-display text-2xl font-bold" onClick={() => setSidebarOpen(false)}>
            Bilal Clothes Admin
          </Link>
        </div>
        <nav className="px-3 space-y-1">
          {adminNav.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  active ? 'bg-primary-foreground/15 text-primary-foreground' : 'text-primary-foreground/70 hover:bg-primary-foreground/10'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4 mr-3" /> Sign Out
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:overflow-y-auto">
        <header className="lg:hidden sticky top-0 z-20 bg-background border-b px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-display text-lg font-bold">Admin</span>
          <div className="w-5" />
        </header>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
