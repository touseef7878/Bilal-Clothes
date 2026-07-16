'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-context';
import { formatPKR } from '@/lib/format';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MessageCircle, Tag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, subtotal, promoCode, promoDiscount, applyPromo, removePromo } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const router = useRouter();

  const shippingFee = subtotal >= 5000 ? 0 : (subtotal > 0 ? 200 : 0);
  const codFee = 0;
  const total = subtotal - promoDiscount + shippingFee + codFee;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplying(true);
    setPromoMessage('');
    const result = await applyPromo(promoInput, subtotal);
    setPromoMessage(result.message);
    if (result.success) setPromoInput('');
    setApplying(false);
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = '+923101533429';
    let message = 'Hello Bilal Clothes! I\'d like to order the following items:\n\n';
    items.forEach((item, i) => {
      message += `${i + 1}. *${item.product_name}*\n   ${item.variant_info}\n   Qty: ${item.quantity} x ${formatPKR(item.price)}\n\n`;
    });
    message += `\nSubtotal: ${formatPKR(subtotal)}\n`;
    if (promoDiscount > 0) message += `Discount: -${formatPKR(promoDiscount)}\n`;
    message += `Shipping: ${shippingFee === 0 ? 'Free' : formatPKR(shippingFee)}\n`;
    message += `Total: ${formatPKR(total)}\n\nMy address: `;
    window.open(`https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="container-narrow py-20 text-center">
        <div className="animate-pulse text-muted-foreground">Loading cart...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-narrow py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/women">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-narrow py-6 sm:py-8 animate-fade-in">
      <h1 className="page-heading mb-6 sm:mb-8">Shopping Cart</h1>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.variant_id} className="flex gap-3 rounded-lg border p-3 sm:gap-4 sm:p-4">
              <Link href={`/product/${item.slug}`} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-24">
                {item.image_url && (
                  <Image src={item.image_url} alt={item.product_name} fill className="object-cover" sizes="96px" />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="min-w-0">
                  <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-medium transition-colors hover:text-primary sm:text-base">
                    {item.product_name}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{item.variant_info}</p>
                  <p className="text-sm font-semibold mt-1">{formatPKR(item.price)}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center border rounded-md">
                    <button
                      onClick={() => updateQuantity(item.variant_id, Math.max(1, item.quantity - 1))}
                      className="flex h-9 w-9 items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[2.25rem] px-2 py-1.5 text-center text-sm font-medium sm:min-w-[2.5rem] sm:px-4">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant_id, Math.min(item.stock_qty, item.quantity + 1))}
                      className="flex h-9 w-9 items-center justify-center hover:bg-muted transition-colors"
                      disabled={item.quantity >= item.stock_qty}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variant_id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="space-y-4 rounded-lg border p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-bold">Order Summary</h2>

            {/* Promo Code */}
            <div>
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{promoCode}</span>
                  </div>
                  <button onClick={removePromo} className="text-green-600 hover:text-green-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleApplyPromo} disabled={applying} variant="outline" size="sm" className="self-start sm:self-auto">
                    Apply
                  </Button>
                </div>
              )}
              {promoMessage && (
                <p className={`text-xs mt-1 ${promoMessage.includes('success') ? 'text-green-600' : 'text-destructive'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPKR(subtotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPKR(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shippingFee === 0 ? 'Free' : formatPKR(shippingFee)}</span>
              </div>
              {subtotal < 5000 && subtotal > 0 && (
                <p className="text-xs text-muted-foreground">Add Rs {(5000 - subtotal).toLocaleString()} more for free delivery</p>
              )}
            </div>

            <div className="flex justify-between border-t pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatPKR(total)}</span>
            </div>

            <Button onClick={() => router.push('/checkout')} className="w-full" size="lg">
              Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button onClick={handleWhatsAppOrder} variant="outline" className="w-full" size="lg">
              <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
              Order via WhatsApp
            </Button>
            <Link href="/women" className="block text-center text-sm text-muted-foreground hover:text-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
