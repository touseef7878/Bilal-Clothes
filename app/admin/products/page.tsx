'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPKR, getEffectivePrice, slugify, CLOTHING_SIZES } from '@/lib/format';
import {
  Plus, Pencil, Trash2, X, ChevronDown, ChevronUp,
  Upload, Link2, ImageIcon, ZoomIn, ZoomOut, RotateCw,
  Check, Loader2,
} from 'lucide-react';
import Image from 'next/image';

// ─── Types ──────────────────────────────────────────────────────────────────

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
  product_variants: {
    id: string; size: string | null; color: string | null;
    stock_qty: number; price_override: number | null;
  }[];
  product_images: { id: string; url: string; sort_order: number }[];
};

type ImageEntry = {
  id: string;           // temp id for list key
  url: string;          // final public URL (after upload) or pasted URL
  file?: File;          // raw file before crop/upload
  previewUrl?: string;  // local object URL for preview
  cropState?: CropState;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
};

type CropState = {
  x: number;   // offset in % (0-100) relative to image container
  y: number;
  scale: number;
};

// ─── Main Page ───────────────────────────────────────────────────────────────

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
      .select(`*, categories(name), product_variants(id,size,color,stock_qty,price_override), product_images(id,url,sort_order)`)
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data ?? []);
  };

  useEffect(() => { loadProducts(); loadCategories(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product and all its images?')) return;
    // delete storage images first
    const { data: imgs } = await supabase.from('product_images').select('url').eq('product_id', id);
    if (imgs?.length) {
      const paths = imgs
        .map((img) => img.url.split('/product-images/')[1])
        .filter(Boolean);
      if (paths.length) await supabase.storage.from('product-images').remove(paths);
    }
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  };

  if (loading) return <div className="text-muted-foreground animate-pulse p-6">Loading products…</div>;

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
              {products.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No products yet.</td></tr>
              )}
              {products.map((product) => {
                const totalStock = product.product_variants?.reduce((s, v) => s + v.stock_qty, 0) ?? 0;
                const effectivePrice = getEffectivePrice(product.base_price, product.discount_price);
                const thumb = product.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0];
                return (
                  <>
                    <tr key={product.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setExpandedId(expandedId === product.id ? null : product.id)} className="text-muted-foreground">
                            {expandedId === product.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                            {thumb ? (
                              <Image src={thumb.url} alt={product.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                            )}
                          </div>
                          <span className="font-medium line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{product.categories?.name || '—'}</td>
                      <td className="py-3 px-4 font-medium">{formatPKR(effectivePrice)}</td>
                      <td className="py-3 px-4"><span className={totalStock < 5 ? 'text-amber-600 font-medium' : ''}>{totalStock}</span></td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{product.status}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditing(product); setShowForm(true); }} className="p-1.5 hover:bg-muted rounded-md" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-muted rounded-md text-destructive" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === product.id && (
                      <tr key={product.id + '-exp'} className="bg-muted/20">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="pl-14 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase">Variants</p>
                            {product.product_variants?.map((v) => (
                              <div key={v.id} className="flex items-center gap-4 text-sm">
                                <span>{v.size || '—'}</span>
                                <span>{v.color || '—'}</span>
                                <span className="text-muted-foreground">Stock: {v.stock_qty}</span>
                                {v.price_override && <span className="text-muted-foreground">Price: {formatPKR(v.price_override)}</span>}
                              </div>
                            ))}
                            {product.product_images?.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {product.product_images.sort((a, b) => a.sort_order - b.sort_order).map((img) => (
                                  <div key={img.id} className="relative w-16 h-20 rounded overflow-hidden bg-muted">
                                    <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                                  </div>
                                ))}
                              </div>
                            )}
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

// ─── Image Cropper ───────────────────────────────────────────────────────────

const ASPECT = 3 / 4; // 3:4 portrait — matches storefront display

function ImageCropEditor({
  src,
  cropState,
  onChange,
}: {
  src: string;
  cropState: CropState;
  onChange: (c: CropState) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - lastPos.current.x) / rect.width) * 100;
    const dy = ((e.clientY - lastPos.current.y) / rect.height) * 100;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onChange({ ...cropState, x: cropState.x + dx, y: cropState.y + dy });
  }, [cropState, onChange]);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.touches[0].clientX - lastPos.current.x) / rect.width) * 100;
    const dy = ((e.touches[0].clientY - lastPos.current.y) / rect.height) * 100;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    onChange({ ...cropState, x: cropState.x + dx, y: cropState.y + dy });
  }, [cropState, onChange]);
  const onTouchEnd = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  const scalePct = Math.round((cropState.scale - 1) * 100);

  return (
    <div className="space-y-3">
      {/* Crop frame */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-muted cursor-grab active:cursor-grabbing select-none"
        style={{ aspectRatio: '3/4', maxHeight: 300 }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <img
          src={src}
          alt="crop preview"
          draggable={false}
          style={{
            position: 'absolute',
            width: `${cropState.scale * 100}%`,
            height: `${cropState.scale * 100}%`,
            objectFit: 'cover',
            left: `${cropState.x}%`,
            top: `${cropState.y}%`,
            transform: 'none',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '33.33% 33.33%',
        }} />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="range"
          min={100} max={300} step={1}
          value={Math.round(cropState.scale * 100)}
          onChange={(e) => onChange({ ...cropState, scale: Number(e.target.value) / 100 })}
          className="flex-1 h-2 accent-primary"
        />
        <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground w-12 text-right">+{scalePct}%</span>
        <button
          type="button"
          title="Reset crop"
          onClick={() => onChange({ x: 0, y: 0, scale: 1 })}
          className="p-1.5 hover:bg-muted rounded"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Drag to reposition · Zoom slider to adjust</p>
    </div>
  );
}

// ─── Canvas crop helper ───────────────────────────────────────────────────────

async function cropImageToBlob(
  src: string,
  cropState: CropState,
  outputWidth = 900,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const outputHeight = Math.round(outputWidth / ASPECT);
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not available'));

      // The CSS rendering: image is placed at (x%, y%) with size = scale*100%
      // Container dimensions = outputWidth × outputHeight (at aspect 3/4)
      // Image natural dimensions determine src rectangle
      const containerW = outputWidth;
      const containerH = outputHeight;

      // Where the image top-left is in canvas-pixels
      const imgDrawW = containerW * cropState.scale;
      const imgDrawH = containerH * cropState.scale;
      const imgLeft = (cropState.x / 100) * containerW;
      const imgTop = (cropState.y / 100) * containerH;

      // We need to draw so that the visible canvas window [0..cW, 0..cH] is filled
      // sourceX/Y in the *original* image coordinates
      const scaleXfactor = img.naturalWidth / imgDrawW;
      const scaleYfactor = img.naturalHeight / imgDrawH;

      const sx = (-imgLeft) * scaleXfactor;
      const sy = (-imgTop) * scaleYfactor;
      const sw = containerW * scaleXfactor;
      const sh = containerH * scaleYfactor;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        0.92,
      );
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

// ─── Upload helper ─────────────────────────────────────────────────────────

async function uploadToSupabase(file: File | Blob, filename: string): Promise<string> {
  const ext = filename.split('.').pop() ?? 'jpg';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Single image card (inside the form) ────────────────────────────────────

function ImageCard({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: ImageEntry;
  onUpdate: (e: ImageEntry) => void;
  onRemove: () => void;
}) {
  const [showCrop, setShowCrop] = useState(false);
  const previewSrc = entry.previewUrl || entry.url;

  const handleCropChange = (c: CropState) => {
    onUpdate({ ...entry, cropState: c });
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/30">
      {/* Thumbnail strip */}
      <div className="relative aspect-[3/4] w-full max-h-40 bg-muted overflow-hidden">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt=""
            className="w-full h-full object-cover"
            style={entry.cropState ? {
              transform: `scale(${entry.cropState.scale})`,
              transformOrigin: `${-entry.cropState.x / entry.cropState.scale}% ${-entry.cropState.y / entry.cropState.scale}%`,
            } : undefined}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        {entry.uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
        {entry.uploaded && (
          <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 left-1 bg-background/80 rounded-full p-0.5 hover:bg-background"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-2 space-y-1.5">
        {entry.error && <p className="text-xs text-destructive">{entry.error}</p>}

        {/* If file-based and not yet uploaded, show crop toggle */}
        {entry.previewUrl && !entry.uploaded && (
          <button
            type="button"
            onClick={() => setShowCrop(!showCrop)}
            className="w-full text-xs text-primary hover:underline text-left"
          >
            {showCrop ? 'Hide crop' : 'Adjust crop & size'}
          </button>
        )}

        {/* URL field for URL-mode entries */}
        {!entry.previewUrl && (
          <Input
            className="h-7 text-xs"
            placeholder="https://..."
            value={entry.url}
            onChange={(e) => onUpdate({ ...entry, url: e.target.value, uploaded: !!e.target.value })}
          />
        )}
      </div>

      {/* Crop editor — shown inline below the card */}
      {showCrop && entry.previewUrl && (
        <div className="border-t p-3">
          <ImageCropEditor
            src={entry.previewUrl}
            cropState={entry.cropState ?? { x: 0, y: 0, scale: 1 }}
            onChange={handleCropChange}
          />
        </div>
      )}
    </div>
  );
}

// ─── Product Form ────────────────────────────────────────────────────────────

function ProductForm({
  product, categories, onClose, onSaved,
}: {
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
    product?.product_variants?.map((v) => ({ ...v })) ??
    [{ size: 'M', color: '', stock_qty: 0, price_override: '' }]
  );

  // Image entries: existing images loaded as URL entries, new uploads as file entries
  const [images, setImages] = useState<ImageEntry[]>(() =>
    product?.product_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        url: img.url,
        uploaded: true,
      })) ?? []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // ── File handling ──────────────────────────────────────────────────────────

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newEntries: ImageEntry[] = arr.map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      url: '',
      file,
      previewUrl: URL.createObjectURL(file),
      cropState: { x: 0, y: 0, scale: 1 },
      uploaded: false,
    }));
    setImages((prev) => [...prev, ...newEntries]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const addUrlEntry = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, { id: `url-${Date.now()}`, url: trimmed, uploaded: true }]);
    setUrlInput('');
  };

  const updateEntry = (id: string, updated: ImageEntry) => {
    setImages((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  const removeEntry = (id: string) => {
    setImages((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((e) => e.id !== id);
    });
  };

  // ── Upload all pending files ───────────────────────────────────────────────

  const uploadPendingImages = async (): Promise<ImageEntry[]> => {
    const result: ImageEntry[] = [];
    for (const entry of images) {
      if (entry.uploaded && entry.url) { result.push(entry); continue; }
      if (!entry.file && !entry.previewUrl) { result.push(entry); continue; }

      setImages((prev) => prev.map((e) => e.id === entry.id ? { ...e, uploading: true, error: undefined } : e));
      try {
        const srcForCrop = entry.previewUrl!;
        const crop = entry.cropState ?? { x: 0, y: 0, scale: 1 };
        const blob = await cropImageToBlob(srcForCrop, crop, 900);
        const filename = entry.file?.name ?? 'image.jpg';
        const publicUrl = await uploadToSupabase(blob, filename);
        const updated = { ...entry, url: publicUrl, uploading: false, uploaded: true };
        setImages((prev) => prev.map((e) => e.id === entry.id ? updated : e));
        result.push(updated);
      } catch (err: any) {
        const errEntry = { ...entry, uploading: false, error: err.message ?? 'Upload failed' };
        setImages((prev) => prev.map((e) => e.id === entry.id ? errEntry : e));
        result.push(errEntry);
      }
    }
    return result;
  };

  // ── Save product ──────────────────────────────────────────────────────────

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
        const { error: uErr } = await supabase.from('products').update(productData).eq('id', product.id);
        if (uErr) throw uErr;
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('products').insert(productData).select('id').single();
        if (insertError) throw insertError;
        productId = newProduct.id;
      }

      // Upload images and collect final URLs
      const finalImages = await uploadPendingImages();
      const failedUploads = finalImages.filter((e) => e.error);
      if (failedUploads.length) throw new Error(`${failedUploads.length} image(s) failed to upload`);

      // Delete old images (DB rows + storage objects if editing)
      if (product) {
        const oldStorageUrls = product.product_images
          ?.filter((img) => img.url.includes('/product-images/'))
          .map((img) => img.url.split('/product-images/')[1])
          .filter(Boolean);
        if (oldStorageUrls?.length) {
          await supabase.storage.from('product-images').remove(oldStorageUrls);
        }
        const oldIds = product.product_images?.map((i) => i.id) ?? [];
        if (oldIds.length) await supabase.from('product_images').delete().in('id', oldIds);
        const oldVarIds = product.product_variants?.map((v) => v.id) ?? [];
        if (oldVarIds.length) await supabase.from('product_variants').delete().in('id', oldVarIds);
      }

      // Insert new variants
      const variantData = variants.filter((v) => v.size || v.color).map((v) => ({
        product_id: productId,
        size: v.size || null,
        color: v.color || null,
        stock_qty: Number(v.stock_qty) || 0,
        price_override: v.price_override ? Number(v.price_override) : null,
      }));
      if (variantData.length) await supabase.from('product_variants').insert(variantData);

      // Insert new image rows
      const imageData = finalImages
        .filter((e) => e.url?.trim())
        .map((e, i) => ({ product_id: productId, url: e.url.trim(), sort_order: i }));
      if (imageData.length) await supabase.from('product_images').insert(imageData);

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">{error}</div>}

        <div className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Base Price (PKR) *</Label>
              <Input type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Discount Price (optional)</Label>
              <Input type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} />
            </div>
            <div>
              <Label>Fabric</Label>
              <Input value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} placeholder="Cotton, Lawn…" />
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

          {/* ── Variants ─────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Variants</Label>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setVariants([...variants, { size: 'M', color: '', stock_qty: 0, price_override: '' }])}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Select value={v.size ?? ''} onValueChange={(val) => { const n = [...variants]; n[i] = { ...v, size: val }; setVariants(n); }}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Size" /></SelectTrigger>
                      <SelectContent>{CLOTHING_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Input className="flex-1 h-9" placeholder="Color" value={v.color ?? ''} onChange={(e) => { const n = [...variants]; n[i] = { ...v, color: e.target.value }; setVariants(n); }} />
                  <Input className="w-20 h-9" type="number" placeholder="Stock" value={v.stock_qty} onChange={(e) => { const n = [...variants]; n[i] = { ...v, stock_qty: Number(e.target.value) }; setVariants(n); }} />
                  <Input className="w-24 h-9" type="number" placeholder="Override" value={v.price_override ?? ''} onChange={(e) => { const n = [...variants]; n[i] = { ...v, price_override: e.target.value }; setVariants(n); }} />
                  <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Images ───────────────────────────────────────────────────── */}
          <div>
            <Label className="mb-2 block">Product Images</Label>

            {/* Tab toggle */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Link2 className="h-3.5 w-3.5" /> Paste URL
              </button>
            </div>

            {/* Upload dropzone */}
            {activeTab === 'upload' && (
              <div
                ref={dropzoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drop images here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP — max 10 MB each · 3:4 ratio recommended</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            )}

            {/* URL input */}
            {activeTab === 'url' && (
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrlEntry(); } }}
                />
                <Button type="button" variant="outline" onClick={addUrlEntry} disabled={!urlInput.trim()}>
                  Add
                </Button>
              </div>
            )}

            {/* Image grid */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((entry) => (
                  <ImageCard
                    key={entry.id}
                    entry={entry}
                    onUpdate={(updated) => updateEntry(entry.id, updated)}
                    onRemove={() => removeEntry(entry.id)}
                  />
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              First image is the product thumbnail. Crop is applied before upload — final size is 900×1200 px.
            </p>
          </div>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving || !form.name} className="flex-1">
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : 'Save Product'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
