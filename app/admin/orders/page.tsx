'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPKR } from '@/lib/format';
import { Printer, Eye, Download } from 'lucide-react';

const ORDER_STATUSES = ['placed', 'payment_check', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'cancelled'];

const statusColors: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  payment_check: 'bg-cyan-100 text-cyan-700',
  confirmed: 'bg-green-100 text-green-700',
  packed: 'bg-amber-100 text-amber-700',
  shipped: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  returned: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [trackingId, setTrackingId] = useState('');

  const loadOrders = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const openOrder = async (order: any) => {
    setSelectedOrder(order);
    setTrackingId(order.courier_tracking_id ?? '');
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    setOrderItems(items ?? []);
  };

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);

    if (status === 'cancelled' || status === 'returned') {
      const { data: items } = await supabase.from('order_items').select('variant_id, quantity').eq('order_id', orderId);
      if (items) {
        for (const item of items) {
          if (item.variant_id) {
            const { data: variant } = await supabase.from('product_variants').select('stock_qty').eq('id', item.variant_id).maybeSingle();
            if (variant) {
              await supabase.from('product_variants').update({ stock_qty: variant.stock_qty + item.quantity }).eq('id', item.variant_id);
            }
          }
        }
      }
    }

    if (status === 'packed') {
      const { data: items } = await supabase.from('order_items').select('variant_id, quantity').eq('order_id', orderId);
      if (items) {
        for (const item of items) {
          if (item.variant_id) {
            const { data: variant } = await supabase.from('product_variants').select('stock_qty').eq('id', item.variant_id).maybeSingle();
            if (variant) {
              await supabase.from('product_variants').update({ stock_qty: Math.max(0, variant.stock_qty - item.quantity) }).eq('id', item.variant_id);
            }
          }
        }
      }
    }

    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
    loadOrders();
  };

  const saveTracking = async () => {
    if (!selectedOrder) return;
    await supabase.from('orders').update({ courier_tracking_id: trackingId }).eq('id', selectedOrder.id);
    setSelectedOrder({ ...selectedOrder, courier_tracking_id: trackingId });
    loadOrders();
  };

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Status', 'Payment', 'Total', 'Date'];
    const rows = orders.map((o) => [
      o.id,
      o.guest_name || '',
      o.guest_phone || '',
      o.status,
      o.payment_method,
      o.total,
      new Date(o.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
  };

  if (loading) {
    return <div className="text-muted-foreground animate-pulse">Loading orders...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap capitalize ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-muted/30">
                  <td className="py-3 px-4 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                  <td className="py-3 px-4">{order.guest_name || 'Guest'}</td>
                  <td className="py-3 px-4 font-medium">{formatPKR(order.total)}</td>
                  <td className="py-3 px-4 capitalize">{order.payment_method === 'cod' ? 'COD' : order.payment_method}</td>
                  <td className="py-3 px-4">
                    <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                      <SelectTrigger className={`h-8 text-xs font-medium border-0 ${statusColors[order.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-PK')}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => openOrder(order)} className="p-1.5 hover:bg-muted rounded-md">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No orders found.</div>
        )}
      </div>

      {selectedOrder && (
        <Dialog open onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder.id.slice(0, 8)}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Customer</h3>
                  <p className="text-sm">{selectedOrder.guest_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.guest_phone}</p>
                  {selectedOrder.guest_email && <p className="text-sm text-muted-foreground">{selectedOrder.guest_email}</p>}
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Payment</h3>
                  <p className="text-sm capitalize">{selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method}</p>
                  <p className="text-sm text-muted-foreground">Status: {selectedOrder.payment_status}</p>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                  <p className="text-sm">{selectedOrder.shipping_address.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address.address}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province}</p>
                  {selectedOrder.shipping_address.area && <p className="text-sm text-muted-foreground">Landmark: {selectedOrder.shipping_address.area}</p>}
                </div>
              )}

              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Items</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-muted-foreground">{item.variant_info} × {item.quantity}</p>
                      </div>
                      <span className="font-medium">{formatPKR(item.price_at_purchase * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPKR(selectedOrder.subtotal)}</span></div>
                  {Number(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPKR(selectedOrder.discount_amount)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatPKR(selectedOrder.shipping_fee)}</span></div>
                  <div className="flex justify-between font-bold"><span>Total</span><span>{formatPKR(selectedOrder.total)}</span></div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Courier Tracking ID</h3>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. TCS-12345"
                  />
                  <Button size="sm" onClick={saveTracking}>Save</Button>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-1">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
