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
      <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-lg bg-muted sm:mb-3">
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
          <span className="absolute left-2 top-2 rounded bg-destructive px-1.5 py-1 text-[10px] font-bold text-destructive-foreground sm:left-3 sm:top-3 sm:px-2 sm:text-xs">
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-foreground/80 px-1.5 py-1 text-[10px] font-bold text-background sm:left-3 sm:top-3 sm:px-2 sm:text-xs">
            Out of Stock
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-all hover:bg-background sm:right-3 sm:top-3 sm:bottom-auto sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Add to wishlist"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-destructive text-destructive' : ''}`} />
        </button>
        <div className="absolute inset-x-0 bottom-0 hidden p-3 opacity-0 transition-opacity translate-y-2 duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
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
        <h3 className="line-clamp-1 text-xs font-medium text-foreground transition-colors group-hover:text-primary sm:text-sm">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold text-foreground sm:text-sm">{formatPKR(effectivePrice)}</span>
          {discountPct > 0 && (
            <span className="text-[10px] text-muted-foreground line-through sm:text-xs">{formatPKR(product.base_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
