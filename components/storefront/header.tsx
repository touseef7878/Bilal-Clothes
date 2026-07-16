'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/men', label: 'Men' },
  { href: '/women', label: 'Women' },
  { href: '/sale', label: 'Sale' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <div className="bg-primary text-primary-foreground text-center text-xs py-2 px-4">
        Free delivery on orders over Rs 5,000 • Cash on Delivery available across Pakistan
      </div>
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all duration-300',
          scrolled ? 'shadow-md border-b' : 'border-b'
        )}
      >
        <div className="container-narrow">
          <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
            <button
              className="lg:hidden -ml-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex min-w-0 items-center gap-2 shrink-0">
              <span className="font-display truncate text-xl font-bold tracking-tight text-primary sm:text-2xl">
                Bilal Clothes
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary relative group',
                    pathname === link.href ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
              <Link href="/account" className="hidden sm:block">
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/account?tab=wishlist" className="hidden sm:block">
                <Button variant="ghost" size="icon" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]" aria-label="Cart">
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1 animate-scale-in">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t bg-background animate-fade-in">
            <nav className="container-narrow py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'min-h-[44px] rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted',
                    pathname === link.href ? 'text-primary bg-muted' : 'text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t mt-2 pt-2 flex gap-2">
                <Link href="/account" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" /> Account
                  </Button>
                </Link>
                <Link href="/account?tab=wishlist" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2" /> Wishlist
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
