import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWeeklyOwnerSummary } from '@/lib/email';

// Called by Vercel Cron every Monday at 8am PKT (3am UTC)
// vercel.json: { "crons": [{ "path": "/api/weekly-summary", "schedule": "0 3 * * 1" }] }
// Protected by a secret header so it can't be triggered publicly

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const weekStartISO = weekStart.toISOString();

  // Fetch orders from the past 7 days
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, total, payment_method, status, created_at')
    .gte('created_at', weekStartISO)
    .neq('status', 'cancelled');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allOrders = orders ?? [];
  const codOrders = allOrders.filter((o) => o.payment_method === 'cod');
  const onlineOrders = allOrders.filter((o) => o.payment_method !== 'cod');
  const pendingOrders = allOrders.filter((o) => ['placed', 'payment_check'].includes(o.status));

  // Top products this week
  const { data: topItems } = await supabase
    .from('order_items')
    .select('product_name, quantity, orders!inner(created_at, status)')
    .gte('orders.created_at', weekStartISO)
    .neq('orders.status', 'cancelled');

  const productQty: Record<string, number> = {};
  (topItems ?? []).forEach((item: any) => {
    productQty[item.product_name] = (productQty[item.product_name] || 0) + item.quantity;
  });
  const topProducts = Object.entries(productQty)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  await sendWeeklyOwnerSummary({
    weekStart: weekStart.toLocaleDateString('en-PK', { dateStyle: 'medium' }),
    weekEnd: now.toLocaleDateString('en-PK', { dateStyle: 'medium' }),
    totalOrders: allOrders.length,
    totalRevenue: allOrders.reduce((s, o) => s + Number(o.total), 0),
    codOrders: codOrders.length,
    codRevenue: codOrders.reduce((s, o) => s + Number(o.total), 0),
    onlineOrders: onlineOrders.length,
    onlineRevenue: onlineOrders.reduce((s, o) => s + Number(o.total), 0),
    pendingOrders: pendingOrders.length,
    topProducts,
  });

  return NextResponse.json({ success: true, ordersProcessed: allOrders.length });
}
