# E-Commerce Shopping Web

A modern, full-featured e-commerce storefront built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)

## Features

- Product browsing by category (Men, Women, Sale)
- Product detail pages with size/color selection
- Shopping cart
- Checkout with multiple payment methods (COD, Bank Transfer)
- Order confirmation
- User account & login
- Admin dashboard (products, orders, customers, promos, settings)
- WhatsApp contact button
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your Supabase credentials in .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/                  # Next.js App Router pages
components/
  admin/              # Admin dashboard components
  storefront/         # Customer-facing components
  ui/                 # Reusable UI primitives (shadcn/ui)
lib/                  # Utilities and helpers
hooks/                # Custom React hooks
```

## Environment Variables

See `.env.example` for the required environment variables.
