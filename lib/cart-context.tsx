'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getOrCreateSessionId } from '@/lib/format';

export type CartItem = {
  variant_id: string;
  product_id: string;
  product_name: string;
  slug: string;
  variant_info: string;
  size: string | null;
  color: string | null;
  price: number;
  image_url: string | null;
  quantity: number;
  stock_qty: number;
};

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  itemCount: number;
  promoCode: string | null;
  promoDiscount: number;
  appliedPromo: { code: string; type: string; value: number } | null;
  applyPromo: (code: string, subtotal: number) => Promise<{ success: boolean; message: string }>;
  removePromo: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: string; value: number } | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionId = getOrCreateSessionId();

      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .or(`session_id.eq.${sessionId}${session ? `,user_id.eq.${session.user.id}` : ''}`)
        .maybeSingle();

      if (!cart) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: cartItems } = await supabase
        .from('cart_items')
        .select(`
          id,
          variant_id,
          quantity,
          product_variants!inner (
            id,
            size,
            color,
            stock_qty,
            price_override,
            products!inner (
              id,
              name,
              slug,
              base_price,
              discount_price,
              product_images (url, sort_order)
            )
          )
        `)
        .eq('cart_id', cart.id);

      if (!cartItems) {
        setItems([]);
        setLoading(false);
        return;
      }

      const mapped: CartItem[] = cartItems.map((ci: any) => {
        const variant = ci.product_variants;
        const product = variant.products;
        const effectivePrice = variant.price_override ?? (product.discount_price ?? product.base_price);
        const image = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
        return {
          variant_id: variant.id,
          product_id: product.id,
          product_name: product.name,
          slug: product.slug,
          variant_info: [variant.size, variant.color].filter(Boolean).join(' / ') || 'Standard',
          size: variant.size,
          color: variant.color,
          price: effectivePrice,
          image_url: image?.url ?? null,
          quantity: ci.quantity,
          stock_qty: variant.stock_qty,
        };
      });

      setItems(mapped);
    } catch (e) {
      console.error('Failed to load cart:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const getCartId = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    const sessionId = getOrCreateSessionId();

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .or(`session_id.eq.${sessionId}${session ? `,user_id.eq.${session.user.id}` : ''}`)
      .maybeSingle();

    if (cart) return cart.id;

    const insertData: any = { session_id: sessionId };
    if (session) insertData.user_id = session.user.id;

    const { data: newCart, error } = await supabase
      .from('carts')
      .insert(insertData)
      .select('id')
      .single();

    if (error) return null;
    return newCart.id;
  };

  const addItem = useCallback(async (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const cartId = await getCartId();
    if (!cartId) return;

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('variant_id', item.variant_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ cart_id: cartId, variant_id: item.variant_id, quantity });
    }

    await loadCart();
  }, [loadCart]);

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    if (quantity < 1) return;
    const cartId = await getCartId();
    if (!cartId) return;

    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('cart_id', cartId)
      .eq('variant_id', variantId);

    await loadCart();
  }, [loadCart]);

  const removeItem = useCallback(async (variantId: string) => {
    const cartId = await getCartId();
    if (!cartId) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('variant_id', variantId);

    await loadCart();
  }, [loadCart]);

  const clearCart = useCallback(async () => {
    const cartId = await getCartId();
    if (!cartId) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    setItems([]);
    setPromoCode(null);
    setPromoDiscount(0);
    setAppliedPromo(null);
  }, []);

  const applyPromo = useCallback(async (code: string, sub: number) => {
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !promo) {
      return { success: false, message: 'Invalid promo code' };
    }

    if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
      return { success: false, message: 'This promo code has expired' };
    }

    if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
      return { success: false, message: 'This promo code has reached its usage limit' };
    }

    if (sub < promo.min_order) {
      return { success: false, message: `Minimum order of Rs ${promo.min_order} required` };
    }

    let discount = 0;
    if (promo.type === 'percentage') {
      discount = (sub * promo.value) / 100;
      if (promo.max_discount) discount = Math.min(discount, promo.max_discount);
    } else {
      discount = promo.value;
    }
    discount = Math.min(discount, sub);

    setPromoCode(code.toUpperCase());
    setPromoDiscount(discount);
    setAppliedPromo({ code: code.toUpperCase(), type: promo.type, value: promo.value });

    return { success: true, message: 'Promo code applied successfully' };
  }, []);

  const removePromo = useCallback(() => {
    setPromoCode(null);
    setPromoDiscount(0);
    setAppliedPromo(null);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
        promoCode,
        promoDiscount,
        appliedPromo,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
