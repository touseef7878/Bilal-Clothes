'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  Shop: [
    { href: '/men', label: 'Men' },
    { href: '/women', label: 'Women' },
    { href: '/sale', label: 'Sale' },
  ],
  Help: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/faq', label: 'FAQ' },
    { href: '/size-guide', label: 'Size Guide' },
    { href: '/returns', label: 'Return & Exchange' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Get in Touch' },
  ],
};

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container-narrow py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <h2 className="font-display text-3xl font-bold mb-3">Bilal Clothes</h2>
            <p className="text-sm text-primary-foreground/70 max-w-xs mb-6">
              Premium Pakistani fashion for men and women. Crafted with care, delivered with love across Pakistan.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/touseef__r" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider">Get in Touch</h3>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> +92 310 1533429
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" /> touseefurrehman5554@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> Mughal Market, Taxila, Pakistan
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Bilal Clothes. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-primary-foreground/50">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>JazzCash</span>
            <span>•</span>
            <span>EasyPaisa</span>
            <span>•</span>
            <span>Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
