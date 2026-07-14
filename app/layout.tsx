import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { StoreLayout } from '@/components/storefront/store-layout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bilal Clothes — Premium Pakistani Men\'s & Women\'s Fashion',
  description: 'Shop premium men\'s and women\'s clothing — shalwar kameez, kurtas, lawn suits, and more. Cash on Delivery available across Pakistan.',
  openGraph: {
    title: 'Bilal Clothes — Premium Pakistani Fashion',
    description: 'Shop premium men\'s and women\'s clothing. COD available across Pakistan.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <StoreLayout>{children}</StoreLayout>
      </body>
    </html>
  );
}
