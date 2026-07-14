'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Package, MessageCircle, Home } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderData) {
        setOrder(orderData);
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
        setOrderItems(items ?? []);
      }
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) {
    return <div className="container-narrow py-20 text-center text-muted-foreground">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="container-narrow py-20 text-center">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Link href="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const phoneNumber = '+923101533429';
    const message = encodeURIComponent(`Hello Bilal Clothes! I just placed order #${order.id.slice(0, 8)}. Could you confirm it?`);
    window.open(`https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <div className="container-narrow py-12 max-w-2xl animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Thank you for your order. We'll be in touch shortly.</p>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Order Date</p>
            <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div>
          <h2 className="font-medium mb-3">Order Items</h2>
          <div className="space-y-3">
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
        </div>

        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPKR(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatPKR(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPKR(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span>
            <span>{formatPKR(order.total)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-medium mb-2">Payment Method</h2>
          <p className="text-sm text-muted-foreground capitalize">
            {order.payment_method === 'cod' ? 'Cash on Delivery' :
             order.payment_method === 'bank_transfer' ? 'Bank Transfer' :
             order.payment_method}
          </p>
          {order.payment_method === 'cod' && (
            <p className="text-sm text-muted-foreground mt-1">Please keep {formatPKR(order.total)} ready for delivery.</p>
          )}
          {order.payment_method === 'bank_transfer' && (
            <p className="text-sm text-muted-foreground mt-1">Please upload your payment proof and we'll verify shortly.</p>
          )}
        </div>

        {order.shipping_address && (
          <div className="border-t pt-4">
            <h2 className="font-medium mb-2">Shipping Address</h2>
            <p className="text-sm text-muted-foreground">{order.shipping_address.name}</p>
            <p className="text-sm text-muted-foreground">{order.shipping_address.address}</p>
            <p className="text-sm text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.province}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button onClick={handleWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white">
          <MessageCircle className="h-4 w-4 mr-2" /> Confirm via WhatsApp
        </Button>
        <Link href="/account" className="flex-1">
          <Button variant="outline" className="w-full">
            <Package className="h-4 w-4 mr-2" /> Track Order
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button variant="ghost" className="w-full">
            <Home className="h-4 w-4 mr-2" /> Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
