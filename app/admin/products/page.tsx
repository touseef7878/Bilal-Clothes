'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatPKR, getEffectivePrice, slugify, CLOTHING_SIZES } from '@/lib/format';
import { Plus, Pencil, Trash2, Package, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fabric: string | null;
  base_price: number;
  discount_price: number | null;
  sku: string | null;
  status: string;
  is_featured: boolean;
  is_bestseller: boolean;
  category_id: string | null;
  categories: { name: string } | null;
  product_variants: { id: string; size: string | null; color: string | null; stock_qty: number; price_override: number | null }[];
  product_images: { id: string; url: string; sort_order: number }[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        categories (name),
        product_variants (id, size, color, stock_qty, price_override),
        product_images (id, url, sort_order)
      `)
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data ?? []);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  };

  if (loading) {
    return <div className="text-muted-foreground animate-pulse">Loading products...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.product_variants?.reduce((s, v) => s + v.stock_qty, 0) ?? 0;
                const effectivePrice = getEffectivePrice(product.base_price, product.discount_price);
                return (
                  <>
                    <tr key={product.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {expandedId === product.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{product.categories?.name || '—'}</td>
                      <td className="py-3 px-4 font-medium">{formatPKR(effectivePrice)}</td>
                      <td className="py-3 px-4">
                        <span className={totalStock < 5 ? 'text-amber-600 font-medium' : ''}>{totalStock}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditing(product); setShowForm(true); }}
                            className="p-1.5 hover:bg-muted rounded-md"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 hover:bg-muted rounded-md text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === product.id && (
                      <tr className="bg-muted/20">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="pl-8 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase">Variants</p>
                            {product.product_variants?.map((v) => (
                              <div key={v.id} className="flex items-center gap-4 text-sm">
                                <span>{v.size || '—'}</span>
                                <span>{v.color || '—'}</span>
                                <span className="text-muted-foreground">Stock: {v.stock_qty}</span>
                                {v.price_override && <span className="text-muted-foreground">Price: {formatPKR(v.price_override)}</span>}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { loadProducts(); setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ProductForm({ product, categories, onClose, onSaved }: {
  product: Product | null;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    fabric: product?.fabric ?? '',
    base_price: product?.base_price ?? 0,
    discount_price: product?.discount_price ?? '',
    sku: product?.sku ?? '',
    status: product?.status ?? 'active',
    is_featured: product?.is_featured ?? false,
    is_bestseller: product?.is_bestseller ?? false,
    category_id: product?.category_id ?? '',
  });
  const [variants, setVariants] = useState<any[]>(
    product?.product_variants?.map((v) => ({ ...v })) ?? [{ size: 'M', color: '', stock_qty: 0, price_override: '' }]
  );
  const [imageUrls, setImageUrls] = useState(
    product?.product_images?.map((img) => img.url) ?? ['']
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const slug = form.slug || slugify(form.name);
      const productData: any = {
        name: form.name,
        slug,
        description: form.description || null,
        fabric: form.fabric || null,
        base_price: Number(form.base_price),
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        sku: form.sku || null,
        status: form.status,
        is_featured: form.is_featured,
        is_bestseller: form.is_bestseller,
        category_id: form.category_id || null,
      };

      let productId = product?.id;

      if (product) {
        await supabase.from('products').update(productData).eq('id', product.id);
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();
        if (insertError) throw insertError;
        productId = newProduct.id;
      }

      if (product) {
        const existingVariantIds = product.product_variants?.map((v) => v.id) ?? [];
        if (existingVariantIds.length > 0) {
          await supabase.from('product_variants').delete().in('id', existingVariantIds);
        }
        const existingImageIds = product.product_images?.map((img) => img.id) ?? [];
        if (existingImageIds.length > 0) {
          await supabase.from('product_images').delete().in('id', existingImageIds);
        }
      }

      const variantData = variants
        .filter((v) => v.size || v.color)
        .map((v) => ({
          product_id: productId,
          size: v.size || null,
          color: v.color || null,
          stock_qty: Number(v.stock_qty) || 0,
          price_override: v.price_override ? Number(v.price_override) : null,
        }));

      if (variantData.length > 0) {
        await supabase.from('product_variants').insert(variantData);
      }

      const imageData = imageUrls
        .filter((url) => url.trim())
        .map((url, i) => ({ product_id: productId, url: url.trim(), sort_order: i }));

      if (imageData.length > 0) {
        await supabase.from('product_images').insert(imageData);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">{error}</div>}

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Base Price (PKR)</Label>
              <Input type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Discount Price (optional)</Label>
              <Input type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Fabric</Label>
            <Input value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} placeholder="e.g. Cotton, Lawn" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Featured</Label>
              <Select value={form.is_featured ? 'yes' : 'no'} onValueChange={(v) => setForm({ ...form, is_featured: v === 'yes' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bestseller</Label>
              <Select value={form.is_bestseller ? 'yes' : 'no'} onValueChange={(v) => setForm({ ...form, is_bestseller: v === 'yes' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Variants</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { size: 'M', color: '', stock_qty: 0, price_override: '' }])}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select value={v.size ?? ''} onValueChange={(val) => { const next = [...variants]; next[i] = { ...v, size: val }; setVariants(next); }}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Size" /></SelectTrigger>
                      <SelectContent>
                        {CLOTHING_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input className="flex-1 h-9" placeholder="Color" value={v.color ?? ''} onChange={(e) => { const next = [...variants]; next[i] = { ...v, color: e.target.value }; setVariants(next); }} />
                  <Input className="w-20 h-9" type="number" placeholder="Stock" value={v.stock_qty} onChange={(e) => { const next = [...variants]; next[i] = { ...v, stock_qty: Number(e.target.value) }; setVariants(next); }} />
                  <Input className="w-24 h-9" type="number" placeholder="Price" value={v.price_override ?? ''} onChange={(e) => { const next = [...variants]; next[i] = { ...v, price_override: e.target.value }; setVariants(next); }} />
                  <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Image URLs</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setImageUrls([...imageUrls, ''])}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <Input className="flex-1" placeholder="https://..." value={url} onChange={(e) => { const next = [...imageUrls]; next[i] = e.target.value; setImageUrls(next); }} />
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} className="p-2 text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving || !form.name} className="flex-1">
              {saving ? 'Saving...' : 'Save Product'}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
