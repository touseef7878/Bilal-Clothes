'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatPKR } from '@/lib/format';
import Link from 'next/link';
import { ShoppingBag, Package, Users, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [orders, products, customers, lowStockRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('product_variants').select('id, stock_qty, size, color, products (name, slug)').lt('stock_qty', 5),
      ]);

      const allOrders = orders.data ?? [];
      const todayRev = allOrders.filter((o) => o.created_at >= todayStart).reduce((s, o) => s + Number(o.total), 0);
      const weekRev = allOrders.filter((o) => o.created_at >= weekStart).reduce((s, o) => s + Number(o.total), 0);
      const monthRev = allOrders.filter((o) => o.created_at >= monthStart).reduce((s, o) => s + Number(o.total), 0);
      const pending = allOrders.filter((o) => o.status === 'placed' || o.status === 'payment_check').length;

      setStats({
        todayRevenue: todayRev,
        weekRevenue: weekRev,
        monthRevenue: monthRev,
        totalOrders: allOrders.length,
        pendingOrders: pending,
        totalProducts: products.count ?? 0,
        totalCustomers: customers.count ?? 0,
      });

      setRecentOrders(allOrders.slice(0, 5));
      setLowStock(lowStockRes.data ?? []);

      const days: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        const dayOrders = allOrders.filter((o) => {
          const d = new Date(o.created_at);
          return d >= dayStart && d < dayEnd;
        });
        days.push({
          date: dayStart.toLocaleDateString('en-PK', { weekday: 'short' }),
          revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
          orders: dayOrders.length,
        });
      }
      setChartData(days);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  const statCards = [
    { label: "Today's Revenue", value: formatPKR(stats.todayRevenue), icon: TrendingUp, color: 'text-green-600' },
    { label: 'This Week', value: formatPKR(stats.weekRevenue), icon: TrendingUp, color: 'text-blue-600' },
    { label: 'This Month', value: formatPKR(stats.monthRevenue), icon: TrendingUp, color: 'text-primary' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-indigo-600' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-teal-600' },
  ];

  const statusColors: Record<string, string> = {
    placed: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    packed: 'bg-amber-100 text-amber-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-background border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174 62% 22%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(174 62% 22%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(42 15% 88%)' }}
                formatter={(v: number) => [formatPKR(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(174 62% 22%)" fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-background border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Low Stock Alert</h2>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All products well stocked.</p>
          ) : (
            <div className="space-y-3">
              {lowStock.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium line-clamp-1">{item.products?.name}</p>
                    <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${item.stock_qty === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.stock_qty} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 font-medium">Order ID</th>
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium">Total</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                    <td className="py-3">{order.guest_name || 'Guest'}</td>
                    <td className="py-3 font-medium">{formatPKR(order.total)}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[order.status] || 'bg-muted'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-PK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
