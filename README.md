# Bilal Clothes — Pakistani Men's & Women's Clothing Store

A production-grade, mobile-first e-commerce website for a single-brand Pakistani clothing store. Built on Next.js App Router + Supabase, deployed on Vercel. Supports Cash on Delivery (COD), Bank Transfer, WhatsApp ordering, a full admin panel, and a role-based access system for owner/operator/staff.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL 17) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (product images) |
| Email | Google SMTP (order confirmations, admin summaries) |
| Payments | COD + Bank Transfer (live) · Safepay stub (TODO) |
| Deployment | Vercel (frontend) + Supabase (backend) |
| Charts | Recharts |

---

## Project Structure

```
├── app/
│   ├── page.tsx                     # Homepage — hero, categories, featured, bestsellers
│   ├── layout.tsx                   # Root layout — fonts, metadata, StoreLayout wrapper
│   ├── globals.css                  # Global styles, CSS variables, custom utilities
│   ├── men/page.tsx                 # Men's category listing
│   ├── women/page.tsx               # Women's category listing
│   ├── sale/page.tsx                # Sale items listing
│   ├── product/[slug]/page.tsx      # Product detail page (ISR, schema.org JSON-LD)
│   ├── cart/page.tsx                # Cart — quantities, promo code, totals
│   ├── checkout/page.tsx            # Multi-step checkout (COD / Bank Transfer)
│   ├── order-confirmation/page.tsx  # Post-order confirmation page
│   ├── account/
│   │   ├── page.tsx                 # Account dashboard — order history, addresses, wishlist
│   │   └── login/page.tsx           # Login / signup
│   ├── admin/
│   │   ├── layout.tsx               # Admin shell — auth guard, sidebar nav
│   │   ├── page.tsx                 # Dashboard — sales chart, order counts, low-stock alerts
│   │   ├── products/page.tsx        # Product CRUD — add/edit/delete, variants, images
│   │   ├── orders/page.tsx          # Order management — status workflow, filters, details
│   │   ├── customers/page.tsx       # Customer list — order history, flag/unflag
│   │   ├── promos/page.tsx          # Promo code management
│   │   └── settings/page.tsx        # Store settings (owner-only: payout config)
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── faq/page.tsx
│   ├── returns/page.tsx
│   └── size-guide/page.tsx
│
├── components/
│   ├── storefront/
│   │   ├── store-layout.tsx         # Wraps all storefront pages — header + footer + cart provider
│   │   ├── header.tsx               # Nav, cart icon, mobile menu
│   │   ├── footer.tsx               # Links, social, WhatsApp number
│   │   ├── hero-carousel.tsx        # Homepage hero banner (Embla Carousel)
│   │   ├── product-card.tsx         # Product grid card — image, price, sale badge
│   │   ├── product-grid.tsx         # Filtered/sorted product grid
│   │   ├── product-detail.tsx       # PDP — gallery, size/color selector, Add to Cart, WhatsApp
│   │   ├── category-page.tsx        # Category listing — filters, sort, grid
│   │   └── whatsapp-button.tsx      # Floating WhatsApp chat button (site-wide)
│   ├── admin/
│   │   └── admin-layout.tsx         # Sidebar, top bar, role-aware nav items
│   └── ui/                          # shadcn/ui primitives (button, card, dialog, etc.)
│
├── lib/
│   ├── supabase/
│   │   └── client.ts                # Supabase client + full TypeScript Database types
│   ├── cart-context.tsx             # React context — cart state, add/remove/update, localStorage sync
│   ├── demo-data.ts                 # Fallback data shown when Supabase is not connected
│   ├── format.ts                    # PKR currency formatter, date helpers
│   └── utils.ts                     # cn() class utility (clsx + tailwind-merge)
│
├── hooks/
│   └── use-toast.ts                 # Toast notification hook (sonner)
│
├── supabase/
│   └── migrations/
│       ├── 001_core_schema.sql      # All tables, enums, RLS policies, indexes, triggers
│       ├── 002_seed_data.sql        # Categories, 16 products, variants, images
│       ├── 002b_seed_products.sql   # (split) product inserts
│       ├── 002c_seed_variants.sql   # (split) variant inserts
│       ├── 002d_seed_images.sql     # (split) image inserts
│       ├── 002e_seed_settings.sql   # Store settings + promo codes
│       ├── 003_promo_usage_function.sql  # increment_promo_usage() RPC
│       ├── 004_admin_user_and_settings.sql  # Admin auth user + admin_users row
│       └── 006_clean_role_system.sql  # Role cleanup — single source of truth
│
├── .env                             # Local secrets (gitignored)
├── .env.example                     # Template for required env vars
├── next.config.js
├── tailwind.config.ts
└── PRD_Pakistani_Clothing_Store.md  # Full product requirements document
```

---

## Database Schema

16 tables in Supabase PostgreSQL, all with RLS enabled.

```
profiles          — extends auth.users (name, phone, role: customer|admin)
addresses         — saved shipping addresses (Pakistan-specific fields)
categories        — hierarchical (parent_id), gender: men|women|unisex
products          — catalog with base_price, discount_price, sale dates, status
product_variants  — size/color combos, individual stock_qty, price_override
product_images    — multiple images per product, sort_order for drag-reorder
carts             — per-user or per-session cart
cart_items        — cart line items linked to a specific variant
orders            — full order record with status workflow enum, payment method/status
order_items       — snapshot of items at purchase (price_at_purchase preserved)
promo_codes       — %, flat, min order, expiry, usage limits
reviews           — ratings + comments + photo URLs, approval flow
wishlist          — saved products per user
settings          — key/value store (store_info, shipping, currency)
admin_users       — role assignments: owner | operator | staff
activity_log      — append-only audit log (no UPDATE/DELETE RLS — immutable)
```

### Order Status Workflow

```
PLACED → PAYMENT_CHECK → CONFIRMED → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
                                                                          ↘ RETURNED
                                    ↘ CANCELLED (stock auto-restored)
```

---

## Role System

Two-table design — clean separation between "is this person an admin?" and "what level are they?":

| Table | Values | Purpose |
|---|---|---|
| `profiles.role` | `customer` \| `admin` | Simple is-admin flag |
| `admin_users.role` | `owner` \| `operator` \| `staff` | Granular access level |

### What Each Role Can Do

| Action | Owner | Operator | Staff | Customer |
|---|---|---|---|---|
| Browse storefront | ✅ | ✅ | ✅ | ✅ |
| Place orders | ✅ | ✅ | ✅ | ✅ |
| Product CRUD | ✅ | ✅ | ❌ | ❌ |
| Order management | ✅ | ✅ | ✅ (status only) | Own orders only |
| Customer management | ✅ | ✅ | ❌ | ❌ |
| Promo codes | ✅ | ✅ | ❌ | ❌ |
| Store settings | ✅ | ❌ | ❌ | ❌ |
| Payment/payout config | ✅ | ❌ | ❌ | ❌ |
| Add/remove admin roles | ✅ | ❌ | ❌ | ❌ |
| Read activity log | ✅ | ✅ | ❌ | ❌ |
| Edit/delete activity log | ❌ | ❌ | ❌ | ❌ |

RLS is enforced at the database level via three helper functions:
- `is_admin(uid)` — true if user exists in `admin_users`
- `is_owner(uid)` — true only if `admin_users.role = 'owner'`
- `get_admin_role(uid)` — returns `owner` / `operator` / `staff` / null

---

## Demo Mode

When `NEXT_PUBLIC_SUPABASE_URL` is missing or contains `placeholder`, the app automatically switches to demo mode — all pages render with hardcoded data from `lib/demo-data.ts`. No database required to browse the UI.

To exit demo mode: fill in real Supabase credentials in `.env` and restart.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier is enough)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

WHATSAPP_BUSINESS_NUMBER=+92XXXXXXXXXX

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=your-gmail@gmail.com
OWNER_EMAIL=owner@gmail.com

# Safepay (fill when merchant account is ready)
SAFEPAY_PUBLIC_KEY=
SAFEPAY_SECRET_KEY=
SAFEPAY_WEBHOOK_SECRET=
```

### 3. Run database migrations

Connect Supabase MCP or paste each file from `supabase/migrations/` into the Supabase SQL Editor in order (001 → 006).

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Admin Panel

Route: `/admin` — protected, requires a user with a row in `admin_users`.

Default admin login (created by migration 004):
- **Email:** `touseefurrehman5554@gmail.com`
- **Password:** `BilalAdmin2026!`
- **Role:** `owner`

### Admin Sections

| Section | Route | Description |
|---|---|---|
| Dashboard | `/admin` | Sales chart (Recharts), order counts by status, low-stock alerts |
| Products | `/admin/products` | Full CRUD, variants, multi-image upload, per-product sale pricing |
| Orders | `/admin/orders` | Status workflow, order detail, filter by status, COD/online tag |
| Customers | `/admin/customers` | Customer list, order history, flag/unflag for COD fraud |
| Promos | `/admin/promos` | Create/manage promo codes (%, flat, expiry, usage limits) |
| Settings | `/admin/settings` | Store info, shipping rates (owner-only: payment config) |

---

## Storefront Pages

| Page | Route | Notes |
|---|---|---|
| Homepage | `/` | Hero carousel, categories, featured, bestsellers, newsletter CTA |
| Men's | `/men` | Category listing with filters and sort |
| Women's | `/women` | Category listing with filters and sort |
| Sale | `/sale` | Discounted products only |
| Product | `/product/[slug]` | ISR, schema.org JSON-LD, gallery, variants, Add to Cart, WhatsApp order |
| Cart | `/cart` | Editable quantities, promo code, shipping estimate |
| Checkout | `/checkout` | COD / Bank Transfer — shipping info, delivery, payment, review |
| Order Confirmation | `/order-confirmation` | Post-checkout summary |
| Account | `/account` | Order history, saved addresses, wishlist (requires login) |
| Login | `/account/login` | Supabase Auth email/password |
| About | `/about` | Brand story |
| Contact | `/contact` | Phone, WhatsApp, email |
| FAQ | `/faq` | Accordion-style FAQ |
| Returns | `/returns` | Exchange and return policy |
| Size Guide | `/size-guide` | Size charts by category |

---

## Payment Methods

| Method | Status | Notes |
|---|---|---|
| Cash on Delivery (COD) | ✅ Live | Default, pre-selected at checkout |
| Bank Transfer | ✅ Live | Manual proof upload, admin confirms |
| Safepay (card/EasyPaisa/bank account) | 🔧 Stub | Code structure ready — add API keys when merchant account is set up |
| JazzCash | ⏳ Phase 2 | Verify Safepay coverage first |

---

## WhatsApp Integration

No paid WhatsApp Business API needed. Uses `wa.me` deep links:

- **Product page** — "Order via WhatsApp" button pre-fills product name + URL
- **Cart page** — "Order via WhatsApp" button pre-fills cart summary
- **Site-wide** — floating WhatsApp chat button (bottom-right)
- **Number** configured via `WHATSAPP_BUSINESS_NUMBER` env var

---

## Seed Data

Migration 002 seeds the database with:

- **10 categories** — Men, Women + 4 subcategories each (Kurta, Waistcoat, Formal, Shalwar Kameez / Lawn, Stitched, Unstitched, Kurtis)
- **16 products** — 8 men's, 8 women's with Pexels placeholder images
- **48 variants** — size/color combinations with stock counts
- **3 promo codes** — WELCOME10, FLAT500, EID15
- **Store settings** — Bilal Clothes branding, Taxila address, shipping rates

---

## Known Gaps / Phase 2

- [ ] Guest checkout RLS — `orders` insert policy needs to allow `anon` role for guest orders
- [ ] Email OTP confirmation for COD orders (fraud reduction)
- [ ] Safepay live integration (needs merchant account in owner's name)
- [ ] SMS notifications (paid per-message — deferred)
- [ ] Courier API integration (TCS / Leopards / PostEx)
- [ ] Abandoned cart recovery email
- [ ] Weekly owner summary email (Google SMTP configured, cron job needed)
- [ ] CSV bulk product import/export
- [ ] Product reviews moderation UI
- [ ] Google Analytics / Meta Pixel

---

## Scripts

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `SUPABASE_DB_URL` | Optional | Direct Postgres connection string |
| `WHATSAPP_BUSINESS_NUMBER` | ✅ | WhatsApp number for `wa.me` links |
| `SMTP_HOST` | ✅ | Google SMTP host (`smtp.gmail.com`) |
| `SMTP_PORT` | ✅ | SMTP port (`587`) |
| `SMTP_USER` | ✅ | Gmail address |
| `SMTP_PASS` | ✅ | Google App Password (not your Gmail password) |
| `SMTP_FROM` | ✅ | From address for outgoing emails |
| `OWNER_EMAIL` | ✅ | Owner's email for weekly summary |
| `SAFEPAY_PUBLIC_KEY` | Phase 2 | Safepay merchant public key |
| `SAFEPAY_SECRET_KEY` | Phase 2 | Safepay merchant secret key |
| `SAFEPAY_WEBHOOK_SECRET` | Phase 2 | Safepay webhook verification secret |
