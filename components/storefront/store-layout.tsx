'use client';

import { CartProvider } from '@/lib/cart-context';
import { Header } from './header';
import { Footer } from './footer';
import { WhatsAppButton } from './whatsapp-button';

export function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
    </CartProvider>
  );
}
