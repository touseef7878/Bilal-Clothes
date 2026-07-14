'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeInfo, setStoreInfo] = useState({
    name: 'Bilal Clothes',
    tagline: 'Premium Pakistani Fashion — Bismillah',
    whatsapp_number: '+923101533429',
    email: 'touseefurrehman5554@gmail.com',
    phone: '+92 310 1533429',
    address: 'Mughal Market, Taxila, Pakistan',
    instagram: 'https://instagram.com/touseef__r',
    facebook: 'https://facebook.com',
  });
  const [shipping, setShipping] = useState({
    flat_rate: 200,
    free_over_threshold: 5000,
    cod_fee: 100,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('*').in('key', ['store_info', 'shipping']);
      if (data) {
        data.forEach((row) => {
          if (row.key === 'store_info' && row.value) {
            setStoreInfo((prev) => ({ ...prev, ...row.value as any }));
          }
          if (row.key === 'shipping' && row.value) {
            setShipping((prev) => ({ ...prev, ...row.value as any }));
          }
        });
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    await supabase.from('settings').upsert({
      key: 'store_info',
      value: storeInfo as any,
      updated_at: new Date().toISOString(),
    });

    await supabase.from('settings').upsert({
      key: 'shipping',
      value: shipping as any,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <div className="bg-background border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Store Information</h2>

        <div>
          <Label>Store Name</Label>
          <Input value={storeInfo.name} onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })} />
        </div>
        <div>
          <Label>Tagline</Label>
          <Input value={storeInfo.tagline} onChange={(e) => setStoreInfo({ ...storeInfo, tagline: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>WhatsApp Number</Label>
            <Input value={storeInfo.whatsapp_number} onChange={(e) => setStoreInfo({ ...storeInfo, whatsapp_number: e.target.value })} placeholder="+923101533429" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={storeInfo.phone} onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={storeInfo.email} onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })} />
        </div>
        <div>
          <Label>Address</Label>
          <Input value={storeInfo.address} onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Instagram URL</Label>
            <Input value={storeInfo.instagram} onChange={(e) => setStoreInfo({ ...storeInfo, instagram: e.target.value })} />
          </div>
          <div>
            <Label>Facebook URL</Label>
            <Input value={storeInfo.facebook} onChange={(e) => setStoreInfo({ ...storeInfo, facebook: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="bg-background border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Shipping Settings</h2>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Flat Rate (Rs)</Label>
            <Input type="number" value={shipping.flat_rate} onChange={(e) => setShipping({ ...shipping, flat_rate: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Free Over (Rs)</Label>
            <Input type="number" value={shipping.free_over_threshold} onChange={(e) => setShipping({ ...shipping, free_over_threshold: Number(e.target.value) })} />
          </div>
          <div>
            <Label>COD Fee (Rs)</Label>
            <Input type="number" value={shipping.cod_fee} onChange={(e) => setShipping({ ...shipping, cod_fee: Number(e.target.value) })} />
          </div>
        </div>
      </div>

      <div className="bg-background border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Payment Gateway</h2>
        <p className="text-sm text-muted-foreground">
          Payment gateway integration (JazzCash, EasyPaisa, Card) is structured for easy integration.
          Add your gateway credentials in the environment variables and configure the webhook endpoint.
        </p>
        <div className="bg-muted/50 rounded-md p-4 text-sm space-y-2">
          <p className="font-medium">Required Environment Variables:</p>
          <p className="font-mono text-xs text-muted-foreground">JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, JAZZCASH_INTEGRITY_SALT</p>
          <p className="font-mono text-xs text-muted-foreground">EASYPaisa_MERCHANT_ID, EASYPaisa_PASSWORD</p>
          <p className="font-mono text-xs text-muted-foreground">PAYMENT_GATEWAY_API_KEY (for card processing)</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1 animate-fade-in">
            <CheckCircle className="h-4 w-4" /> Settings saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
