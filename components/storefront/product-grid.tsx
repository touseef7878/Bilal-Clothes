'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/storefront/product-card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';
import { CLOTHING_SIZES } from '@/lib/format';

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  discount_price: number | null;
  fabric: string | null;
  is_bestseller?: boolean;
  product_images: { url: string; sort_order: number }[];
  product_variants: { id: string; size: string | null; color: string | null; stock_qty: number; price_override: number | null }[];
};

type Filters = {
  sizes: string[];
  colors: string[];
  fabrics: string[];
  priceRange: [number, number];
};

export function ProductGrid({ products, categoryName }: { products: Product[]; categoryName: string }) {
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);

  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.product_variants?.forEach((v) => v.color && set.add(v.color)));
    return Array.from(set);
  }, [products]);

  const allFabrics = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.fabric && set.add(p.fabric));
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (sizes.length > 0) {
      result = result.filter((p) =>
        p.product_variants?.some((v) => v.size && sizes.includes(v.size))
      );
    }
    if (colors.length > 0) {
      result = result.filter((p) =>
        p.product_variants?.some((v) => v.color && colors.includes(v.color))
      );
    }
    if (fabrics.length > 0) {
      result = result.filter((p) => p.fabric && fabrics.includes(p.fabric));
    }
    result = result.filter((p) => {
      const price = p.discount_price ?? p.base_price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => (a.discount_price ?? a.base_price) - (b.discount_price ?? b.base_price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.discount_price ?? b.base_price) - (a.discount_price ?? a.base_price));
        break;
      case 'popularity':
        result.sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller));
        break;
      default:
        break;
    }

    return result;
  }, [products, sizes, colors, fabrics, priceRange, sort]);

  const toggleArray = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const activeFilterCount = sizes.length + colors.length + fabrics.length;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Price Range</h3>
        <div className="px-2">
          <Slider
            min={0}
            max={15000}
            step={500}
            value={priceRange}
            onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Rs {priceRange[0]}</span>
            <span>Rs {priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Size</h3>
        <div className="space-y-2">
          {CLOTHING_SIZES.map((size) => (
            <div key={size} className="flex items-center gap-2">
              <Checkbox
                id={`size-${size}`}
                checked={sizes.includes(size)}
                onCheckedChange={() => toggleArray(sizes, size, setSizes)}
              />
              <Label htmlFor={`size-${size}`} className="text-sm cursor-pointer">{size}</Label>
            </div>
          ))}
        </div>
      </div>

      {allColors.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Color</h3>
          <div className="space-y-2">
            {allColors.map((color) => (
              <div key={color} className="flex items-center gap-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={colors.includes(color)}
                  onCheckedChange={() => toggleArray(colors, color, setColors)}
                />
                <Label htmlFor={`color-${color}`} className="text-sm cursor-pointer">{color}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {allFabrics.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Fabric</h3>
          <div className="space-y-2">
            {allFabrics.map((fabric) => (
              <div key={fabric} className="flex items-center gap-2">
                <Checkbox
                  id={`fabric-${fabric}`}
                  checked={fabrics.includes(fabric)}
                  onCheckedChange={() => toggleArray(fabrics, fabric, setFabrics)}
                />
                <Label htmlFor={`fabric-${fabric}`} className="text-sm cursor-pointer">{fabric}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => { setSizes([]); setColors([]); setFabrics([]); }}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <div className="pt-8">
                <h2 className="font-display text-xl font-bold mb-6">Filters</h2>
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="font-display text-lg font-bold mb-6">Filters</h2>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No products match your filters.</p>
              <Button variant="outline" onClick={() => { setSizes([]); setColors([]); setFabrics([]); setPriceRange([0, 15000]); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
