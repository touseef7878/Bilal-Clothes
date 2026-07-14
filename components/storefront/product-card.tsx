'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPKR, getEffectivePrice, getDiscountPercentage } from '@/lib/format';
import { useCart } from '@/lib/cart-context';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    discount_price: number | null;
    product_images?: { url: string; sort_order: number }[];
    product_variants?: { id: string; stock_qty: number; size: string | null; color: string | null; price_override: number | null }[];
  };
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const image = product.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0];
  const effectivePrice = getEffectivePrice(product.base_price, product.discount_price);
  const discountPct = getDiscountPercentage(product.base_price, product.discount_price);
  const firstVariant = product.product_variants?.[0];
  const totalStock = product.product_variants?.reduce((sum, v) => sum + v.stock_qty, 0) ?? 0;
  const outOfStock = totalStock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant || outOfStock) return;
    setAdding(true);
    await addItem({
      variant_id: firstVariant.id,
      product_id: product.id,
      product_name: product.name,
      slug: product.slug,
      variant_info: [firstVariant.size, firstVariant.color].filter(Boolean).join(' / ') || 'Standard',
      size: firstVariant.size,
      color: firstVariant.color,
      price: firstVariant.price_override ?? effectivePrice,
      image_url: image?.url ?? null,
      stock_qty: firstVariant.stock_qty,
    });
    setAdding(false);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/account';
      return;
    }
    if (wishlisted) {
      await supabase.from('wishlist').delete().eq('user_id', session.user.id).eq('product_id', product.id);
      setWlisted(false);
    } else {
      await supabase.from('wishlist').insert({ user_id: session.user.id, product_id: product.id });
      setWlisted(true);
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-3">
        {image && !imgError ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3 right-3 bg-foreground/80 text-background text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-background"
          aria-label="Add to wishlist"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-destructive text-destructive' : ''}`} />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          <Button
            onClick={handleAddToCart}
            disabled={outOfStock || adding}
            className="w-full"
            size="sm"
          >
            {adding ? 'Adding...' : outOfStock ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-foreground">{formatPKR(effectivePrice)}</span>
          {discountPct > 0 && (
            <span className="text-xs text-muted-foreground line-through">{formatPKR(product.base_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
