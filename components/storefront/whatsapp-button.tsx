'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const phoneNumber = '+923101533429';
  const defaultMessage = encodeURIComponent("Hello Bilal Clothes! I have a question about your products.");
  const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1da851] shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" fill="white" />
      <span className="absolute right-full mr-3 bg-foreground text-background text-sm px-3 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us
      </span>
    </a>
  );
}
