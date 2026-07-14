import { supabase } from '@/lib/supabase/client';
import { ProductCard } from '@/components/storefront/product-card';
import { HeroCarousel } from '@/components/storefront/hero-carousel';
import Link from 'next/link';
import { ArrowRight, Truck, RefreshCw, ShieldCheck, MessageCircle } from 'lucide-react';

export const revalidate = 60;

async function getHomepageData() {
  const [categories, featured, bestsellers] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('sort_order'),
    supabase
      .from('products')
      .select(`
        *,
        product_images (url, sort_order),
        product_variants (id, size, color, stock_qty, price_override)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('sort_order')
      .limit(8),
    supabase
      .from('products')
      .select(`
        *,
        product_images (url, sort_order),
        product_variants (id, size, color, stock_qty, price_override)
      `)
      .eq('status', 'active')
      .eq('is_bestseller', true)
      .order('sort_order')
      .limit(4),
  ]);

  return {
    categories: categories.data ?? [],
    featured: featured.data ?? [],
    bestsellers: bestsellers.data ?? [],
  };
}

export default async function Home() {
  const { categories, featured, bestsellers } = await getHomepageData();

  return (
    <div className="animate-fade-in">
      <HeroCarousel />

      {/* Trust Strip */}
      <div className="border-b bg-muted/30">
        <div className="container-narrow py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On orders over Rs 5,000' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '7-day exchange policy' },
              { icon: ShieldCheck, title: 'Secure Payment', desc: 'COD & online options' },
              { icon: MessageCircle, title: 'WhatsApp Support', desc: 'Order via WhatsApp' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="container-narrow py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Shop by Category</h2>
          <p className="text-muted-foreground">Explore our curated collections</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${cat.slug}`} className="group relative aspect-[16/9] rounded-xl overflow-hidden bg-muted">
              <img
                src={cat.gender === 'men'
                  ? 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800'
                  : 'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg?auto=compress&cs=tinysrgb&w=800'
                }
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-white/80 text-sm mb-3">Discover the latest {cat.name.toLowerCase()}'s collection</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-white group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="container-narrow py-16 border-t">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-1">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked just for you</p>
            </div>
            <Link href="/men" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestsellers.length > 0 && (
        <section className="container-narrow py-16 border-t">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-1">Best Sellers</h2>
              <p className="text-muted-foreground">Our most loved pieces</p>
            </div>
            <Link href="/women" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter / WhatsApp CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-narrow py-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Stay in the Loop</h2>
          <p className="text-primary-foreground/70 max-w-md mx-auto mb-6">
            Get notified about new arrivals, exclusive deals, and seasonal sales.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
            />
            <button className="px-6 py-3 rounded-md bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90 transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-primary-foreground/50 mt-3">
            Or message us on WhatsApp: +92 310 1533429
          </p>
        </div>
      </section>
    </div>
  );
}
