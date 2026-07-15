import { supabase } from '@/lib/supabase/client';
import { ProductGrid } from '@/components/storefront/product-grid';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const revalidate = 60;

type Props = {
  params: { slug: string };
  title: string;
  isSalePage?: boolean;
};

export async function CategoryPage({ params, title, isSalePage = false }: Props) {
  const { slug } = params;

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images (url, sort_order),
      product_variants (id, size, color, stock_qty, price_override)
    `)
    .eq('status', 'active');

  if (isSalePage) {
    query = query.not('discount_price', 'is', null);
  } else {
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .eq('slug', slug)
      .maybeSingle();

    // Only 404 if we have a real DB connection but category genuinely doesn't exist
    if (!category && !catError) notFound();

    if (category) {
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', category.id);

      const categoryIds = [category.id, ...(subcategories?.map((s) => s.id) ?? [])];
      query = query.in('category_id', categoryIds);
    } else {
      // No DB connection — return empty products gracefully
      return (
        <div className="container-narrow py-8 animate-fade-in">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{title}</span>
          </nav>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">{title}</h1>
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products available in this category yet.</p>
          </div>
        </div>
      );
    }
  }

  const { data: products } = await query.order('sort_order');

  return (
    <div className="container-narrow py-8 animate-fade-in">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">{title}</h1>

      {products && products.length > 0 ? (
        <ProductGrid products={products} categoryName={title} />
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No products available in this category yet.</p>
        </div>
      )}
    </div>
  );
}
