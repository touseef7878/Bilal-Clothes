'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Flag, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false });
      setCustomers(data ?? []);
      setLoading(false);
    })();
  }, []);

  const openCustomer = async (customer: any) => {
    setSelectedCustomer(customer);
    const { data: orders } = await supabase.from('orders').select('*').eq('user_id', customer.id).order('created_at', { ascending: false });
    setCustomerOrders(orders ?? []);
  };

  const toggleFlag = async (customer: any) => {
    const newFlag = !customer.is_flagged;
    await supabase.from('profiles').update({ is_flagged: newFlag }).eq('id', customer.id);
    setCustomers(customers.map((c) => c.id === customer.id ? { ...c, is_flagged: newFlag } : c));
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer({ ...selectedCustomer, is_flagged: newFlag });
    }
  };

  if (loading) {
    return <div className="text-muted-foreground animate-pulse">Loading customers...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Customers</h1>

      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Phone</th>
                <th className="py-3 px-4 font-medium">Joined</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">{customer.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{customer.email || '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{customer.phone || '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(customer.created_at).toLocaleDateString('en-PK')}</td>
                  <td className="py-3 px-4">
                    {customer.is_flagged ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">Flagged</span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => openCustomer(customer)} className="p-1.5 hover:bg-muted rounded-md">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleFlag(customer)}
                        className={`p-1.5 hover:bg-muted rounded-md ${customer.is_flagged ? 'text-red-600' : 'text-muted-foreground'}`}
                        title={customer.is_flagged ? 'Unflag' : 'Flag customer'}
                      >
                        <Flag className="h-4 w-4" fill={customer.is_flagged ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No customers yet.</div>
        )}
      </div>

      {selectedCustomer && (
        <Dialog open onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <p className="font-medium">{selectedCustomer.name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                <p className="text-sm text-muted-foreground mt-1">Joined: {new Date(selectedCustomer.created_at).toLocaleDateString('en-PK')}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Order History ({customerOrders.length})</h3>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="flex justify-between border rounded-md p-3 text-sm">
                        <div>
                          <p className="font-mono text-xs">#{order.id.slice(0, 8)}</p>
                          <p className="text-muted-foreground capitalize">{order.status.replace(/_/g, ' ')}</p>
                        </div>
                        <span className="font-medium">{formatPKR(order.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant={selectedCustomer.is_flagged ? 'destructive' : 'outline'}
                className="w-full"
                onClick={() => toggleFlag(selectedCustomer)}
              >
                <Flag className="h-4 w-4 mr-2" fill={selectedCustomer.is_flagged ? 'currentColor' : 'none'} />
                {selectedCustomer.is_flagged ? 'Unflag Customer' : 'Flag Customer (COD fraud tracking)'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
