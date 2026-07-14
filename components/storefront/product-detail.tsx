'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Star, ShoppingBag, Heart, Truck, RefreshCw, ShieldCheck, MessageCircle, ZoomIn, Minus, Plus } from 'lucide-react';
import { formatPKR, getEffectivePrice, getDiscountPercentage } from '@/lib/format';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type ProductDetailProps = {
  product: any;
  reviews: any[];
  avgRating: number;
};

export function ProductDetail({ product, reviews, avgRating }: ProductDetailProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.product_variants?.[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const images = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) ?? [];
  const variants = product.product_variants ?? [];
  const selectedVariantData = variants.find((v: any) => v.id === selectedVariant);
  const effectivePrice = getEffectivePrice(product.base_price, product.discount_price);
  const discountPct = getDiscountPercentage(product.base_price, product.discount_price);
  const stockQty = selectedVariantData?.stock_qty ?? 0;
  const inStock = stockQty > 0;
  const lowStock = inStock && stockQty <= 5;

  const sizes: string[] = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))) as string[];
  const colors: string[] = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[];

  const handleAddToCart = async () => {
    if (!selectedVariantData || !inStock) return;
    setAdding(true);
    const price = selectedVariantData.price_override ?? effectivePrice;
    const image = images[0];
    await addItem({
      variant_id: selectedVariantData.id,
      product_id: product.id,
      product_name: product.name,
      slug: product.slug,
      variant_info: [selectedVariantData.size, selectedVariantData.color].filter(Boolean).join(' / ') || 'Standard',
      size: selectedVariantData.size,
      color: selectedVariantData.color,
      price,
      image_url: image?.url ?? null,
      stock_qty: selectedVariantData.stock_qty,
    }, quantity);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = '+923101533429';
    const variantInfo = selectedVariantData
      ? [selectedVariantData.size, selectedVariantData.color].filter(Boolean).join(', ')
      : '';
    const message = encodeURIComponent(
      `Hello Bilal Clothes! I'd like to order:\n\n*${product.name}*\nPrice: ${formatPKR(effectivePrice)}\n${variantInfo ? `Variant: ${variantInfo}\n` : ''}Quantity: ${quantity}\n\nProduct link: ${window.location.href}`
    );
    window.open(`https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  const handleWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/account');
      return;
    }
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('wishlist').delete().eq('id', existing.id);
    } else {
      await supabase.from('wishlist').insert({ user_id: session.user.id, product_id: product.id });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-4 group">
          {images[selectedImage] ? (
            <>
              <Image
                src={images[selectedImage].url}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-5 w-5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="relative aspect-[3/4]">
                    <Image src={images[selectedImage].url} alt={product.name} fill className="object-contain" />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-16 w-16" />
            </div>
          )}
          {discountPct > 0 && (
            <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded">
              -{discountPct}%
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((img: any, i: number) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                  i === selectedImage ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image src={img.url} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>

        <div className="flex items-center gap-3 mb-4">
          {avgRating > 0 && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">({reviews.length} reviews)</span>
            </div>
          )}
          {product.sku && <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold">{formatPKR(effectivePrice)}</span>
          {discountPct > 0 && (
            <span className="text-lg text-muted-foreground line-through">{formatPKR(product.base_price)}</span>
          )}
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

        {/* Size Selector */}
        {sizes.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Size</span>
              <button onClick={() => setShowSizeGuide(true)} className="text-sm text-primary hover:underline">
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size: string) => {
                const variant = variants.find((v: any) => v.size === size && (!selectedVariantData?.color || v.color === selectedVariantData.color));
                const available = variant && variant.stock_qty > 0;
                return (
                  <button
                    key={size}
                    onClick={() => variant && setSelectedVariant(variant.id)}
                    disabled={!available}
                    className={`px-4 py-2.5 rounded-md border-2 text-sm font-medium transition-all ${
                      selectedVariantData?.size === size
                        ? 'border-primary bg-primary/5 text-primary'
                        : available
                        ? 'border-border hover:border-primary'
                        : 'border-border opacity-40 cursor-not-allowed line-through'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Color Selector */}
        {colors.length > 0 && (
          <div className="mb-5">
            <span className="text-sm font-medium block mb-2">Color: <span className="text-muted-foreground">{selectedVariantData?.color}</span></span>
            <div className="flex flex-wrap gap-2">
              {colors.map((color: string) => {
                const variant = variants.find((v: any) => v.color === color && (!selectedVariantData?.size || v.size === selectedVariantData.size));
                const available = variant && variant.stock_qty > 0;
                return (
                  <button
                    key={color}
                    onClick={() => variant && setSelectedVariant(variant.id)}
                    disabled={!available}
                    className={`px-4 py-2.5 rounded-md border-2 text-sm font-medium transition-all ${
                      selectedVariantData?.color === color
                        ? 'border-primary bg-primary/5 text-primary'
                        : available
                        ? 'border-border hover:border-primary'
                        : 'border-border opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Status */}
        <div className="mb-5">
          {!inStock ? (
            <span className="text-sm font-medium text-destructive">Out of Stock</span>
          ) : lowStock ? (
            <span className="text-sm font-medium text-amber-600">Only {stockQty} left in stock!</span>
          ) : (
            <span className="text-sm font-medium text-green-600">In Stock</span>
          )}
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <span className="text-sm font-medium block mb-2">Quantity</span>
          <div className="inline-flex items-center border rounded-md">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-muted transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-6 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
              className="p-3 hover:bg-muted transition-colors"
              disabled={quantity >= stockQty}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleAddToCart} disabled={!inStock || adding} size="lg" variant="outline">
              <ShoppingBag className="h-4 w-4 mr-2" />
              {adding ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button onClick={handleBuyNow} disabled={!inStock} size="lg">
              Buy Now
            </Button>
          </div>
          <Button onClick={handleWhatsAppOrder} size="lg" className="w-full bg-[#25D366] hover:bg-[#1da851] text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Order via WhatsApp
          </Button>
          <Button onClick={handleWishlist} variant="ghost" size="lg" className="w-full">
            <Heart className="h-4 w-4 mr-2" />
            Add to Wishlist
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-3 py-4 border-y mb-6">
          {[
            { icon: Truck, label: 'Free delivery over Rs 5,000' },
            { icon: RefreshCw, label: '7-day easy returns' },
            { icon: ShieldCheck, label: 'COD available' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center gap-1">
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="care">Care</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              {product.fabric && <p><span className="font-medium text-foreground">Fabric:</span> {product.fabric}</p>}
              <p><span className="font-medium text-foreground">SKU:</span> {product.sku || 'N/A'}</p>
              <p>{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="care" className="mt-4">
            <p className="text-sm text-muted-foreground">{product.care_instructions || 'Machine wash cold, hang dry. Do not bleach.'}</p>
          </TabsContent>
          <TabsContent value="delivery" className="mt-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Delivery Time:</span> {product.delivery_time || '3-5 business days'}</p>
              <p><span className="font-medium text-foreground">Shipping:</span> Flat rate of Rs 200 across Pakistan. Free on orders over Rs 5,000.</p>
              <p><span className="font-medium text-foreground">COD:</span> Cash on Delivery available nationwide. Additional Rs 100 COD fee.</p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.user_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSizeGuide(false)}>
          <div className="bg-background rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold mb-4">Size Guide</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Size</th>
                  <th className="text-left py-2">Chest (in)</th>
                  <th className="text-left py-2">Waist (in)</th>
                  <th className="text-left py-2">Length (in)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: 'S', chest: '36-38', waist: '30-32', length: '38' },
                  { size: 'M', chest: '38-40', waist: '32-34', length: '39' },
                  { size: 'L', chest: '40-42', waist: '34-36', length: '40' },
                  { size: 'XL', chest: '42-44', waist: '36-38', length: '41' },
                  { size: 'XXL', chest: '44-46', waist: '38-40', length: '42' },
                ].map((row) => (
                  <tr key={row.size} className="border-b">
                    <td className="py-2 font-medium">{row.size}</td>
                    <td className="py-2">{row.chest}</td>
                    <td className="py-2">{row.waist}</td>
                    <td className="py-2">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button onClick={() => setShowSizeGuide(false)} className="w-full mt-4">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
