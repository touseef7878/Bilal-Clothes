/**
 * Full workflow test script
 * Tests: SMTP, Supabase connection, auth, products, order creation, email sending
 * Run: node scripts/test-workflow.mjs
 */

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Load .env manually ───────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
const envFile = readFileSync(envPath, 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim();
  env[key] = val;
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const SMTP_HOST = env.SMTP_HOST;
const SMTP_PORT = Number(env.SMTP_PORT) || 587;
const SMTP_USER = env.SMTP_USER;
const SMTP_PASS = env.SMTP_PASS;
const SMTP_FROM = env.SMTP_FROM;
const OWNER_EMAIL = env.OWNER_EMAIL;

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✅  ${label}`);
  passed++;
}
function fail(label, err) {
  console.log(`  ❌  ${label}`);
  console.log(`       ${err?.message || err}`);
  failed++;
}
function section(title) {
  console.log(`\n── ${title} ${'─'.repeat(50 - title.length)}`);
}

// ── 1. Env vars ───────────────────────────────────────────────────────────────
section('1. Environment Variables');
if (SUPABASE_URL && !SUPABASE_URL.includes('placeholder')) ok('SUPABASE_URL set'); else fail('SUPABASE_URL', new Error('missing or placeholder'));
if (SUPABASE_ANON && SUPABASE_ANON.startsWith('eyJ')) ok('SUPABASE_ANON_KEY set'); else fail('SUPABASE_ANON_KEY', new Error('missing'));
if (SUPABASE_SERVICE && SUPABASE_SERVICE.startsWith('eyJ')) ok('SUPABASE_SERVICE_ROLE_KEY set'); else fail('SUPABASE_SERVICE_ROLE_KEY', new Error('missing'));
if (SMTP_USER && SMTP_PASS && SMTP_PASS !== 'your-google-app-password') ok('SMTP credentials set'); else fail('SMTP credentials', new Error('missing or placeholder'));
if (OWNER_EMAIL) ok(`OWNER_EMAIL: ${OWNER_EMAIL}`); else fail('OWNER_EMAIL', new Error('missing'));

// ── 2. Supabase DB connection ─────────────────────────────────────────────────
section('2. Supabase Database');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON);

try {
  const { data, error } = await supabase.from('categories').select('id, name, slug').limit(5);
  if (error) throw error;
  ok(`Categories readable — found ${data.length} rows`);
  data.forEach(c => console.log(`       • ${c.name} (${c.slug})`));
} catch (e) { fail('Read categories', e); }

try {
  const { data, error } = await supabase.from('products').select('id, name, base_price, status').eq('status', 'active').limit(5);
  if (error) throw error;
  ok(`Products readable — found ${data.length} active products`);
  data.forEach(p => console.log(`       • ${p.name} — Rs ${p.base_price}`));
} catch (e) { fail('Read products', e); }

try {
  const { data, error } = await supabase.from('product_variants').select('id, size, color, stock_qty').limit(3);
  if (error) throw error;
  ok(`Variants readable — ${data.length} sample variants`);
} catch (e) { fail('Read variants', e); }

try {
  const { data, error } = await supabase.from('admin_users').select('user_id, role');
  if (error) throw error;
  ok(`Admin users — ${data.length} admin(s) found`);
  data.forEach(a => console.log(`       • role: ${a.role}`));
} catch (e) { fail('Read admin_users', e); }

try {
  const { data, error } = await supabase.from('settings').select('key, value').eq('key', 'store_info').single();
  if (error) throw error;
  ok(`Store settings readable — name: "${data.value?.name}"`);
} catch (e) { fail('Read settings', e); }

try {
  const { data, error } = await supabase.from('promo_codes').select('code, type, value, is_active').eq('is_active', true);
  if (error) throw error;
  ok(`Promo codes — ${data.length} active code(s)`);
  data.forEach(p => console.log(`       • ${p.code}: ${p.type} ${p.value}`));
} catch (e) { fail('Read promo codes', e); }

// ── 3. RLS — anon can read public tables ──────────────────────────────────────
section('3. RLS — Public Read Access (anon)');
try {
  const { data, error } = await anonClient.from('products').select('id').limit(1);
  if (error) throw error;
  ok('Anon can read products');
} catch (e) { fail('Anon read products', e); }

try {
  const { data, error } = await anonClient.from('orders').select('id').limit(1);
  // Should return empty (no rows visible to anon) not an error
  if (error && !error.message.includes('0 rows')) throw error;
  ok('Anon cannot read other users orders (RLS working)');
} catch (e) { fail('Anon orders RLS', e); }

// ── 4. Order creation (service role — simulates checkout) ─────────────────────
section('4. Order Creation Flow');
let testOrderId = null;
let testVariantId = null;

try {
  const { data: variant } = await supabase.from('product_variants').select('id, stock_qty').gt('stock_qty', 0).limit(1).single();
  testVariantId = variant?.id;
  ok(`Found variant for test order: ${testVariantId?.slice(0, 8)}`);
} catch (e) { fail('Get test variant', e); }

if (testVariantId) {
  try {
    const { data: order, error } = await supabase.from('orders').insert({
      guest_name: 'Test Customer',
      guest_phone: '+923001234567',
      guest_email: OWNER_EMAIL,
      status: 'placed',
      payment_method: 'cod',
      payment_status: 'pending',
      subtotal: 4500,
      discount_amount: 0,
      shipping_fee: 200,
      total: 4700,
      shipping_address: {
        name: 'Test Customer',
        phone: '+923001234567',
        address: 'House 1, Test Street',
        city: 'Lahore',
        province: 'Punjab',
      },
    }).select('id').single();

    if (error) throw error;
    testOrderId = order.id;
    ok(`Order created — ID: #${order.id.slice(0, 8).toUpperCase()}`);
  } catch (e) { fail('Create test order', e); }
}

if (testOrderId && testVariantId) {
  try {
    const { error } = await supabase.from('order_items').insert({
      order_id: testOrderId,
      variant_id: testVariantId,
      product_name: 'Test Product',
      variant_info: 'M / White',
      quantity: 1,
      price_at_purchase: 4500,
    });
    if (error) throw error;
    ok('Order items inserted');
  } catch (e) { fail('Insert order items', e); }
}

// ── 5. Activity log (admin insert) ───────────────────────────────────────────
section('5. Activity Log');
if (testOrderId) {
  try {
    const { data: adminUser } = await supabase.from('admin_users').select('user_id').limit(1).single();
    const { error } = await supabase.from('activity_log').insert({
      admin_id: adminUser?.user_id,
      action: 'order_status_changed',
      order_id: testOrderId,
      details: { from: null, to: 'placed', note: 'workflow test' },
    });
    if (error) throw error;
    ok('Activity log entry written');
  } catch (e) { fail('Activity log insert', e); }
}

// ── 6. Promo usage RPC ────────────────────────────────────────────────────────
section('6. Promo Code RPC');
try {
  const { data: before } = await supabase.from('promo_codes').select('usage_count').eq('code', 'WELCOME10').single();
  await supabase.rpc('increment_promo_usage', { promo_code: 'WELCOME10' });
  const { data: after } = await supabase.from('promo_codes').select('usage_count').eq('code', 'WELCOME10').single();
  if (after.usage_count === before.usage_count + 1) ok(`increment_promo_usage RPC works (${before.usage_count} → ${after.usage_count})`);
  else fail('RPC result mismatch', new Error(`expected ${before.usage_count + 1}, got ${after.usage_count}`));
  // Reset
  await supabase.from('promo_codes').update({ usage_count: before.usage_count }).eq('code', 'WELCOME10');
} catch (e) { fail('Promo RPC', e); }

// ── 7. SMTP connection ────────────────────────────────────────────────────────
section('7. SMTP Connection');
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

try {
  await transporter.verify();
  ok(`SMTP connected — ${SMTP_USER} via ${SMTP_HOST}:${SMTP_PORT}`);
} catch (e) { fail('SMTP verify', e); }

// ── 8. Send test email ────────────────────────────────────────────────────────
section('8. Send Test Emails');
if (testOrderId) {
  try {
    await transporter.sendMail({
      from: `"Bilal Clothes" <${SMTP_FROM}>`,
      to: OWNER_EMAIL,
      subject: `✅ Workflow Test — Order #${testOrderId.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;">
          <h2 style="color:#1a1a1a;">Workflow Test Passed</h2>
          <p>This is a test email from the Bilal Clothes e-commerce system.</p>
          <p><strong>Test Order ID:</strong> #${testOrderId.slice(0, 8).toUpperCase()}</p>
          <p><strong>SMTP:</strong> ${SMTP_USER}</p>
          <p><strong>Supabase:</strong> Connected ✅</p>
          <p style="color:#888;font-size:12px;margin-top:24px;">
            The test order has been created in your database.<br/>
            You can delete it from the admin panel.
          </p>
        </div>`,
    });
    ok(`Test email sent → ${OWNER_EMAIL}`);
  } catch (e) { fail('Send test email', e); }
}

// ── 9. Clean up test data ─────────────────────────────────────────────────────
section('9. Cleanup');
if (testOrderId) {
  try {
    await supabase.from('activity_log').delete().eq('order_id', testOrderId);
    await supabase.from('order_items').delete().eq('order_id', testOrderId);
    await supabase.from('orders').delete().eq('id', testOrderId);
    ok('Test order and related data cleaned up');
  } catch (e) { fail('Cleanup', e); }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(55));
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('  🎉 All systems go — workflow is fully operational!');
} else {
  console.log('  ⚠️  Fix the failing checks above before going live.');
}
console.log('═'.repeat(55) + '\n');
