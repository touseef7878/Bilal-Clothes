import { supabase } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductDetail } from '@/components/storefront/product-detail';
import { ProductCard } from '@/components/storefront/product-card';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} — Bilal Clothes`,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      categories (name, slug),
      product_images (id, url, sort_order),
      product_variants (id, size, color, sku, stock_qty, price_override),
      reviews (id, rating, comment, user_name, created_at, is_approved)
    `)
    .eq('slug', params.slug)
    .maybeSingle();

  if (!product) notFound();

  const { data: related } = await supabase
    .from('products')
    .select(`*, product_images (url, sort_order), product_variants (id, size, color, stock_qty, price_override)`)
    .eq('status', 'active')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4);

  const approvedReviews = product.reviews?.filter((r: any) => r.is_approved) ?? [];
  const avgRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / approvedReviews.length
    : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? '',
    sku: product.sku ?? '',
    brand: { '@type': 'Brand', name: 'Bilal Clothes' },
    offers: {
      '@type': 'Offer',
      price: product.discount_price ?? product.base_price,
      priceCurrency: 'PKR',
      availability: product.product_variants?.some((v: any) => v.stock_qty > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(approvedReviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: approvedReviews.length,
      },
    }),
  };

  return (
    <div className="container-narrow py-6 sm:py-8 animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-5 flex items-center gap-1.5 overflow-hidden text-sm text-muted-foreground sm:mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        {product.categories && (
          <>
            <Link href={`/${product.categories.slug}`} className="hover:text-foreground">
              {product.categories.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </nav>

      <ProductDetail product={product} reviews={approvedReviews} avgRating={avgRating} />

      {related && related.length > 0 && (
        <section className="mt-12 border-t pt-10 sm:mt-16 sm:pt-12 lg:mt-20">
          <h2 className="font-display mb-6 text-2xl font-bold sm:mb-8 md:text-3xl">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
