import nodemailer from 'nodemailer';

// ─── Transporter ────────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // TLS via STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── Shared HTML wrapper ─────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bilal Clothes</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">BILAL CLOTHES</h1>
              <p style="margin:4px 0 0;color:#aaaaaa;font-size:12px;">Premium Pakistani Fashion</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eeeeee;text-align:center;">
              <p style="margin:0;color:#888888;font-size:12px;">
                Bilal Clothes · Mughal Market, Taxila, Punjab, Pakistan<br/>
                WhatsApp: <a href="https://wa.me/923101533429" style="color:#888888;">+92 310 1533429</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderEmailData = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: {
    product_name: string;
    variant_info: string | null;
    quantity: number;
    price_at_purchase: number;
  }[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    area?: string | null;
  };
  promoCode?: string | null;
};

// ─── Format helpers ──────────────────────────────────────────────────────────

function pkr(amount: number): string {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

function paymentLabel(method: string): string {
  const labels: Record<string, string> = {
    cod: 'Cash on Delivery',
    bank_transfer: 'Bank Transfer',
    jazzcash: 'JazzCash',
    easypaisa: 'EasyPaisa',
    card: 'Card',
  };
  return labels[method] ?? method;
}

// ─── 1. Order Confirmation (to customer) ────────────────────────────────────

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  if (!data.customerEmail) return;

  const itemRows = data.items.map((item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">
        ${item.product_name}${item.variant_info ? ` <span style="color:#888;">(${item.variant_info})</span>` : ''} × ${item.quantity}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;text-align:right;white-space:nowrap;">
        ${pkr(item.price_at_purchase * item.quantity)}
      </td>
    </tr>`).join('');

  const content = `
    <h2 style="margin:0 0 4px;font-size:20px;color:#1a1a1a;">Order Confirmed!</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">
      Assalam-o-Alaikum ${data.customerName}, your order has been placed successfully. We'll contact you shortly.
    </p>

    <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Order ID</p>
      <p style="margin:0;font-size:16px;font-weight:600;font-family:monospace;color:#1a1a1a;">#${data.orderId.slice(0, 8).toUpperCase()}</p>
    </div>

    <h3 style="margin:0 0 12px;font-size:15px;color:#1a1a1a;">Order Items</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${itemRows}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#666;">Subtotal</td>
        <td style="padding:4px 0;font-size:14px;color:#333;text-align:right;">${pkr(data.subtotal)}</td>
      </tr>
      ${data.discountAmount > 0 ? `
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#22a34a;">Discount${data.promoCode ? ` (${data.promoCode})` : ''}</td>
        <td style="padding:4px 0;font-size:14px;color:#22a34a;text-align:right;">-${pkr(data.discountAmount)}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#666;">Shipping</td>
        <td style="padding:4px 0;font-size:14px;color:#333;text-align:right;">${data.shippingFee === 0 ? 'Free' : pkr(data.shippingFee)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0 0;font-size:16px;font-weight:700;color:#1a1a1a;border-top:2px solid #1a1a1a;">Total</td>
        <td style="padding:8px 0 0;font-size:16px;font-weight:700;color:#1a1a1a;text-align:right;border-top:2px solid #1a1a1a;">${pkr(data.total)}</td>
      </tr>
    </table>

    <div style="display:grid;gap:12px;">
      <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Shipping To</p>
        <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
          ${data.shippingAddress.name}<br/>
          ${data.shippingAddress.phone}<br/>
          ${data.shippingAddress.address}<br/>
          ${data.shippingAddress.city}, ${data.shippingAddress.province}
          ${data.shippingAddress.area ? `<br/>${data.shippingAddress.area}` : ''}
        </p>
      </div>
      <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Payment</p>
        <p style="margin:0;font-size:14px;color:#333;font-weight:600;">${paymentLabel(data.paymentMethod)}</p>
        ${data.paymentMethod === 'cod' ? '<p style="margin:4px 0 0;font-size:13px;color:#666;">Pay when you receive your order.</p>' : ''}
        ${data.paymentMethod === 'bank_transfer' ? '<p style="margin:4px 0 0;font-size:13px;color:#e07b00;">Your order will be confirmed once payment is verified.</p>' : ''}
      </div>
    </div>

    <div style="margin-top:24px;text-align:center;">
      <p style="font-size:13px;color:#888;">Questions? WhatsApp us anytime:</p>
      <a href="https://wa.me/923101533429?text=Hi,%20I%20have%20a%20question%20about%20order%20%23${data.orderId.slice(0, 8).toUpperCase()}"
         style="display:inline-block;margin-top:8px;padding:10px 24px;background:#25D366;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
        WhatsApp Us
      </a>
    </div>`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Bilal Clothes" <${process.env.SMTP_FROM}>`,
    to: data.customerEmail,
    subject: `Order Confirmed — #${data.orderId.slice(0, 8).toUpperCase()} | Bilal Clothes`,
    html: emailWrapper(content),
  });
}

// ─── 2. New Order Alert (to admin) ──────────────────────────────────────────

export async function sendAdminOrderAlert(data: OrderEmailData): Promise<void> {
  const adminEmail = process.env.OWNER_EMAIL;
  if (!adminEmail) return;

  const itemList = data.items.map((item) =>
    `• ${item.product_name}${item.variant_info ? ` (${item.variant_info})` : ''} × ${item.quantity} — ${pkr(item.price_at_purchase * item.quantity)}`
  ).join('\n');

  const content = `
    <h2 style="margin:0 0 4px;font-size:20px;color:#1a1a1a;">New Order Received</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">A new order has been placed and needs your attention.</p>

    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#666;">Order ID</td>
          <td style="font-size:14px;font-weight:700;color:#1a1a1a;text-align:right;font-family:monospace;">#${data.orderId.slice(0, 8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#666;padding-top:6px;">Customer</td>
          <td style="font-size:14px;color:#1a1a1a;text-align:right;padding-top:6px;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#666;padding-top:6px;">Phone</td>
          <td style="font-size:14px;color:#1a1a1a;text-align:right;padding-top:6px;">${data.shippingAddress.phone}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#666;padding-top:6px;">Payment</td>
          <td style="font-size:14px;font-weight:600;color:#1a1a1a;text-align:right;padding-top:6px;">${paymentLabel(data.paymentMethod)}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#666;padding-top:6px;">Total</td>
          <td style="font-size:16px;font-weight:700;color:#1a1a1a;text-align:right;padding-top:6px;">${pkr(data.total)}</td>
        </tr>
      </table>
    </div>

    <h3 style="margin:0 0 12px;font-size:15px;color:#1a1a1a;">Items</h3>
    <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      ${data.items.map((item) => `
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:#333;">
          <span>${item.product_name}${item.variant_info ? ` (${item.variant_info})` : ''} × ${item.quantity}</span>
          <span style="font-weight:600;white-space:nowrap;margin-left:12px;">${pkr(item.price_at_purchase * item.quantity)}</span>
        </div>`).join('')}
    </div>

    <h3 style="margin:0 0 12px;font-size:15px;color:#1a1a1a;">Shipping Address</h3>
    <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:24px;font-size:14px;color:#333;line-height:1.7;">
      ${data.shippingAddress.name}<br/>
      ${data.shippingAddress.phone}<br/>
      ${data.shippingAddress.address}<br/>
      ${data.shippingAddress.city}, ${data.shippingAddress.province}
      ${data.shippingAddress.area ? `<br/>${data.shippingAddress.area}` : ''}
    </div>

    <div style="text-align:center;">
      <a href="https://nfvkvczghgmkvlykbvog.supabase.co"
         style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
        View in Admin Panel
      </a>
    </div>`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Bilal Clothes Orders" <${process.env.SMTP_FROM}>`,
    to: adminEmail,
    subject: `🛍️ New Order #${data.orderId.slice(0, 8).toUpperCase()} — ${paymentLabel(data.paymentMethod)} — ${pkr(data.total)}`,
    html: emailWrapper(content),
  });
}

// ─── 3. Weekly Owner Summary ─────────────────────────────────────────────────

export type WeeklySummaryData = {
  weekStart: string;
  weekEnd: string;
  totalOrders: number;
  totalRevenue: number;
  codOrders: number;
  codRevenue: number;
  onlineOrders: number;
  onlineRevenue: number;
  pendingOrders: number;
  topProducts: { name: string; qty: number }[];
};

export async function sendWeeklyOwnerSummary(data: WeeklySummaryData): Promise<void> {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return;

  const content = `
    <h2 style="margin:0 0 4px;font-size:20px;color:#1a1a1a;">Weekly Sales Summary</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">${data.weekStart} — ${data.weekEnd}</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:700;color:#16a34a;">${data.totalOrders}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#666;">Total Orders</p>
      </div>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0;font-size:24px;font-weight:700;color:#16a34a;">${pkr(data.totalRevenue)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#666;">Total Revenue</p>
      </div>
    </div>

    <h3 style="margin:0 0 12px;font-size:15px;color:#1a1a1a;">Payment Breakdown</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f9f9f9;border-radius:8px;">
      <tr style="background:#1a1a1a;color:#fff;">
        <td style="padding:10px 16px;font-size:13px;border-radius:8px 0 0 0;">Method</td>
        <td style="padding:10px 16px;font-size:13px;text-align:center;">Orders</td>
        <td style="padding:10px 16px;font-size:13px;text-align:right;border-radius:0 8px 0 0;">Revenue</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;font-size:14px;color:#333;">Cash on Delivery</td>
        <td style="padding:10px 16px;font-size:14px;color:#333;text-align:center;">${data.codOrders}</td>
        <td style="padding:10px 16px;font-size:14px;color:#333;text-align:right;">${pkr(data.codRevenue)}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;font-size:14px;color:#333;border-top:1px solid #eee;">Online Payment</td>
        <td style="padding:10px 16px;font-size:14px;color:#333;text-align:center;border-top:1px solid #eee;">${data.onlineOrders}</td>
        <td style="padding:10px 16px;font-size:14px;color:#333;text-align:right;border-top:1px solid #eee;">${pkr(data.onlineRevenue)}</td>
      </tr>
    </table>

    ${data.pendingOrders > 0 ? `
    <div style="background:#fff7ed;border:1px solid #fb923c;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#c2410c;">
        ⚠️ <strong>${data.pendingOrders} orders</strong> are still pending confirmation. Please review them in the admin panel.
      </p>
    </div>` : ''}

    ${data.topProducts.length > 0 ? `
    <h3 style="margin:0 0 12px;font-size:15px;color:#1a1a1a;">Top Selling Products</h3>
    <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      ${data.topProducts.map((p, i) => `
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:#333;">
          <span>${i + 1}. ${p.name}</span>
          <span style="color:#666;">${p.qty} sold</span>
        </div>`).join('')}
    </div>` : ''}

    <div style="text-align:center;">
      <a href="https://bilalclothes.vercel.app/admin"
         style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
        Open Admin Panel
      </a>
    </div>`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Bilal Clothes" <${process.env.SMTP_FROM}>`,
    to: ownerEmail,
    subject: `📊 Weekly Summary: ${data.totalOrders} orders, ${pkr(data.totalRevenue)} — Bilal Clothes`,
    html: emailWrapper(content),
  });
}
