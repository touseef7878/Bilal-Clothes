'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

type Promo = {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  min_order: number;
  max_discount: number | null;
  expiry_date: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadPromos = async () => {
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    setPromos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadPromos(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    await supabase.from('promo_codes').delete().eq('id', id);
    loadPromos();
  };

  if (loading) {
    return <div className="text-muted-foreground animate-pulse">Loading promo codes...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Promo Codes</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Promo Code
        </Button>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="py-3 px-4 font-medium">Code</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Value</th>
                <th className="py-3 px-4 font-medium">Min Order</th>
                <th className="py-3 px-4 font-medium">Usage</th>
                <th className="py-3 px-4 font-medium">Expiry</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id} className="border-b hover:bg-muted/30">
                  <td className="py-3 px-4 font-mono font-medium">{promo.code}</td>
                  <td className="py-3 px-4 capitalize">{promo.type}</td>
                  <td className="py-3 px-4">{promo.type === 'percentage' ? `${promo.value}%` : `Rs ${promo.value}`}</td>
                  <td className="py-3 px-4">Rs {promo.min_order}</td>
                  <td className="py-3 px-4 text-muted-foreground">{promo.usage_count}{promo.usage_limit ? `/${promo.usage_limit}` : ''}</td>
                  <td className="py-3 px-4 text-muted-foreground">{promo.expiry_date ? new Date(promo.expiry_date).toLocaleDateString('en-PK') : '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${promo.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(promo); setShowForm(true); }} className="p-1.5 hover:bg-muted rounded-md">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(promo.id)} className="p-1.5 hover:bg-muted rounded-md text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {promos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No promo codes yet.</div>
        )}
      </div>

      {showForm && (
        <PromoForm promo={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { loadPromos(); setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function PromoForm({ promo, onClose, onSaved }: { promo: Promo | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    code: promo?.code ?? '',
    description: promo?.description ?? '',
    type: promo?.type ?? 'percentage',
    value: promo?.value ?? 10,
    min_order: promo?.min_order ?? 0,
    max_discount: promo?.max_discount ?? '',
    expiry_date: promo?.expiry_date ? promo.expiry_date.split('T')[0] : '',
    usage_limit: promo?.usage_limit ?? '',
    is_active: promo?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const data = {
        code: form.code.toUpperCase(),
        description: form.description || null,
        type: form.type,
        value: Number(form.value),
        min_order: Number(form.min_order),
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        is_active: form.is_active,
      };

      if (promo) {
        await supabase.from('promo_codes').update(data).eq('id', promo.id);
      } else {
        await supabase.from('promo_codes').insert(data);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save promo code');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{promo ? 'Edit Promo Code' : 'Add Promo Code'}</DialogTitle>
        </DialogHeader>

        {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">{error}</div>}

        <div className="space-y-4">
          <div>
            <Label>Code</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="20% off summer collection" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value {form.type === 'percentage' ? '(%)' : '(Rs)'}</Label>
              <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Min Order (Rs)</Label>
              <Input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Max Discount (optional)</Label>
              <Input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} placeholder="No limit" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
            </div>
            <div>
              <Label>Usage Limit</Label>
              <Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Unlimited" />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.is_active ? 'active' : 'inactive'} onValueChange={(v) => setForm({ ...form, is_active: v === 'active' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving || !form.code} className="flex-1">
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
