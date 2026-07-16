'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPKR, PAKISTANI_PROVINCES, PAKISTANI_CITIES, validatePakistaniPhone, normalizePhone } from '@/lib/format';
import { Package, MapPin, Heart, LogOut, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/components/storefront/product-card';

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', recipient_name: '', phone: '', address_line: '', city: '', province: '', area: '' });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/account/login?redirect=/account');
        return;
      }
      setUser(session.user);

      const [profileRes, ordersRes, addrRes, wishRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('addresses').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('wishlist').select(`
          product_id,
          products!inner (
            *, product_images (url, sort_order),
            product_variants (id, size, color, stock_qty, price_override)
          )
        `).eq('user_id', session.user.id),
      ]);

      setProfile(profileRes.data);
      setOrders(ordersRes.data ?? []);
      setAddresses(addrRes.data ?? []);
      setWishlist(wishRes.data?.map((w: any) => ({ id: w.product_id, ...w.products })) ?? []);
      setLoading(false);
    })();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleAddAddress = async () => {
    if (!validatePakistaniPhone(newAddr.phone)) {
      alert('Please enter a valid Pakistani phone number');
      return;
    }
    const { data, error } = await supabase.from('addresses').insert({
      user_id: user.id,
      ...newAddr,
      phone: normalizePhone(newAddr.phone),
    }).select('*').single();
    if (data) {
      setAddresses([...addresses, data]);
      setNewAddr({ label: 'Home', recipient_name: '', phone: '', address_line: '', city: '', province: '', area: '' });
      setShowAddressForm(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleRemoveWishlist = async (productId: string) => {
    await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
    setWishlist(wishlist.filter((w) => w.id !== productId));
  };

  if (loading) {
    return <div className="container-narrow py-20 text-center text-muted-foreground">Loading...</div>;
  }

  const statusColors: Record<string, string> = {
    placed: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    packed: 'bg-amber-100 text-amber-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="container-narrow py-6 sm:py-8 animate-fade-in">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-heading">My Account</h1>
          <p className="truncate text-sm text-muted-foreground sm:text-base">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>

      <Tabs defaultValue={initialTab}>
        <TabsList className="scrollbar-hide mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="orders"><Package className="h-4 w-4 mr-2" /> Orders</TabsTrigger>
          <TabsTrigger value="addresses"><MapPin className="h-4 w-4 mr-2" /> Addresses</TabsTrigger>
          <TabsTrigger value="wishlist"><Heart className="h-4 w-4 mr-2" /> Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No orders yet.</p>
              <Link href="/women"><Button>Start Shopping</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border p-4 sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-PK', { dateStyle: 'medium' })}</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColors[order.status] || 'bg-muted'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</p>
                      <p className="font-semibold">{formatPKR(order.total)}</p>
                    </div>
                    {order.courier_tracking_id && (
                      <p className="text-sm text-muted-foreground">Tracking: {order.courier_tracking_id}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex justify-between gap-3 rounded-lg border p-4 sm:p-5">
                <div className="min-w-0">
                  <p className="font-medium">{addr.label}</p>
                  <p className="text-sm text-muted-foreground">{addr.recipient_name}</p>
                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                  <p className="text-sm text-muted-foreground">{addr.address_line}, {addr.city}, {addr.province}</p>
                  {addr.area && <p className="text-sm text-muted-foreground">Landmark: {addr.area}</p>}
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} className="flex h-10 w-10 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {showAddressForm ? (
              <div className="border rounded-lg p-5 space-y-4">
                <h3 className="font-medium">New Address</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Label</Label>
                    <Input value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} placeholder="Home" />
                  </div>
                  <div>
                    <Label>Recipient Name</Label>
                    <Input value={newAddr.recipient_name} onChange={(e) => setNewAddr({ ...newAddr, recipient_name: e.target.value })} placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} placeholder="03001234567" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={newAddr.address_line} onChange={(e) => setNewAddr({ ...newAddr, address_line: e.target.value })} placeholder="House #, Street" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Select value={newAddr.city} onValueChange={(v) => setNewAddr({ ...newAddr, city: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{PAKISTANI_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Select value={newAddr.province} onValueChange={(v) => setNewAddr({ ...newAddr, province: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{PAKISTANI_PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Area / Landmark</Label>
                  <Input value={newAddr.area} onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })} placeholder="Near..." />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={handleAddAddress}>Save Address</Button>
                  <Button variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowAddressForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add New Address
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="wishlist">
          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
              <Link href="/women"><Button>Discover Products</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {wishlist.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                  <button
                    onClick={() => handleRemoveWishlist(product.id)}
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-opacity hover:bg-background sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
