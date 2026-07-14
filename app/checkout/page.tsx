'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/lib/cart-context';
import { formatPKR, PAKISTANI_PROVINCES, PAKISTANI_CITIES, validatePakistaniPhone, normalizePhone } from '@/lib/format';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight, Truck, Wallet, CreditCard, Building2, Upload, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const STEPS = ['Shipping', 'Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { items, subtotal, promoCode, promoDiscount, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [shipping, setShipping] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    area: '',
    notes: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const shippingFee = subtotal >= 5000 ? 0 : 200;
  const codFee = paymentMethod === 'cod' ? 100 : 0;
  const total = subtotal - promoDiscount + shippingFee + codFee;

  const validateShipping = () => {
    if (!shipping.name.trim()) return 'Name is required';
    if (!shipping.phone.trim()) return 'Phone is required';
    if (!validatePakistaniPhone(shipping.phone)) return 'Please enter a valid Pakistani phone number (e.g., 03001234567)';
    if (!shipping.address.trim()) return 'Address is required';
    if (!shipping.city) return 'City is required';
    if (!shipping.province) return 'Province is required';
    return null;
  };

  const handleNext = () => {
    if (step === 0) {
      const err = validateShipping();
      if (err) { setError(err); return; }
    }
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const orderData: any = {
        status: 'placed',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
        subtotal,
        discount_amount: promoDiscount,
        shipping_fee: shippingFee + codFee,
        total,
        promo_code: promoCode,
        shipping_address: {
          name: shipping.name,
          phone: normalizePhone(shipping.phone),
          email: shipping.email || null,
          address: shipping.address,
          city: shipping.city,
          province: shipping.province,
          area: shipping.area || null,
          notes: shipping.notes || null,
        },
        guest_name: shipping.name,
        guest_phone: normalizePhone(shipping.phone),
        guest_email: shipping.email || null,
        notes: shipping.notes || null,
      };

      if (session) {
        orderData.user_id = session.user.id;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_info: item.variant_info,
        quantity: item.quantity,
        price_at_purchase: item.price,
        image_url: item.image_url,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      if (promoCode) {
        await supabase.rpc('increment_promo_usage', { promo_code: promoCode });
      }

      await clearCart();

      router.push(`/order-confirmation?id=${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-narrow py-20 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Link href="/women"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-narrow py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                i < step ? 'bg-primary text-primary-foreground border-primary'
                : i === step ? 'border-primary text-primary'
                : 'border-border text-muted-foreground'
              }`}>
                {i < step ? <Check className="h-5 w-5" /> : <span className="text-sm font-semibold">{i + 1}</span>}
              </div>
              <span className={`text-xs mt-1 ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 -mt-5 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Shipping */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-xl font-bold">Shipping Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} placeholder="03001234567" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })} placeholder="john@example.com" />
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input id="address" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} placeholder="House #, Street, Area" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select value={shipping.city} onValueChange={(v) => setShipping({ ...shipping, city: v })}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      {PAKISTANI_CITIES.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="province">Province *</Label>
                  <Select value={shipping.province} onValueChange={(v) => setShipping({ ...shipping, province: v })}>
                    <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                    <SelectContent>
                      {PAKISTANI_PROVINCES.map((prov) => <SelectItem key={prov} value={prov}>{prov}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="area">Area / Landmark (optional)</Label>
                <Input id="area" value={shipping.area} onChange={(e) => setShipping({ ...shipping, area: e.target.value })} placeholder="Near landmark or area name" />
              </div>
              <div>
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Input id="notes" value={shipping.notes} onChange={(e) => setShipping({ ...shipping, notes: e.target.value })} placeholder="Any special instructions" />
              </div>
            </div>
          )}

          {/* Step 2: Delivery */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-xl font-bold">Delivery Method</h2>
              <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <div className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Standard Delivery</p>
                        <p className="text-sm text-muted-foreground">3-5 business days • {shippingFee === 0 ? 'Free' : formatPKR(shippingFee)}</p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="express" id="express" disabled />
                  <Label htmlFor="express" className="flex-1 cursor-pointer opacity-50">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Express Delivery (Coming Soon)</p>
                        <p className="text-sm text-muted-foreground">1-2 business days</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-xl font-bold">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive • Additional Rs 100 COD fee</p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-sm text-muted-foreground">Transfer to our bank account and upload proof</p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="jazzcash" id="jazzcash" disabled />
                  <Label htmlFor="jazzcash" className="flex-1 cursor-pointer opacity-50">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">JazzCash (Coming Soon)</p>
                        <p className="text-sm text-muted-foreground">Mobile wallet payment</p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="easypaisa" id="easypaisa" disabled />
                  <Label htmlFor="easypaisa" className="flex-1 cursor-pointer opacity-50">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">EasyPaisa (Coming Soon)</p>
                        <p className="text-sm text-muted-foreground">Mobile wallet payment</p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="card" id="card" disabled />
                  <Label htmlFor="card" className="flex-1 cursor-pointer opacity-50">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Debit/Credit Card (Coming Soon)</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'bank_transfer' && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 animate-fade-in">
                  <div>
                    <p className="text-sm font-medium mb-1">Bank Account Details:</p>
                    <p className="text-sm text-muted-foreground">Bank: HBL • Account Title: Bilal Clothes Pvt Ltd</p>
                    <p className="text-sm text-muted-foreground">Account #: 0011-2345678-001</p>
                    <p className="text-sm text-muted-foreground">IBAN: PK36 HABB 0011 2345 6780 01</p>
                  </div>
                  <div>
                    <Label htmlFor="proof" className="text-sm">Upload Payment Proof</Label>
                    <div className="mt-1 border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)}
                        className="text-sm"
                      />
                      {paymentProof && <p className="text-sm text-green-600 mt-1">Selected: {paymentProof.name}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-xl font-bold">Review Your Order</h2>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <p className="text-sm text-muted-foreground">{shipping.name}</p>
                <p className="text-sm text-muted-foreground">{normalizePhone(shipping.phone)}</p>
                <p className="text-sm text-muted-foreground">{shipping.address}</p>
                <p className="text-sm text-muted-foreground">{shipping.city}, {shipping.province}</p>
                {shipping.area && <p className="text-sm text-muted-foreground">Landmark: {shipping.area}</p>}
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Payment Method</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' :
                   paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                   paymentMethod === 'jazzcash' ? 'JazzCash' :
                   paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'Card'}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Order Items</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.variant_id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.product_name} ({item.variant_info}) × {item.quantity}</span>
                      <span className="font-medium">{formatPKR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handlePlaceOrder} disabled={submitting} size="lg">
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="border rounded-lg p-6 sticky top-24 space-y-3">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>
            <div className="space-y-2 text-sm border-t pt-3">
              {items.map((item) => (
                <div key={item.variant_id} className="flex justify-between">
                  <span className="text-muted-foreground line-clamp-1">{item.product_name} × {item.quantity}</span>
                  <span className="font-medium">{formatPKR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPKR(subtotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({promoCode})</span>
                  <span>-{formatPKR(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shippingFee === 0 ? 'Free' : formatPKR(shippingFee)}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COD Fee</span>
                  <span className="font-medium">{formatPKR(codFee)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatPKR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
