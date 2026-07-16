'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    title: 'Summer Collection 2026',
    subtitle: 'Breathable lawn suits & kurtas for the season',
    cta: 'Shop Women',
    href: '/women',
    image: 'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    title: 'Eid Special Arrivals',
    subtitle: 'Celebrate in style with our festive collection',
    cta: 'Shop Men',
    href: '/men',
    image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    title: 'Up to 30% Off',
    subtitle: 'Premium quality at unbeatable prices',
    cta: 'Shop Sale',
    href: '/sale',
    image: 'https://images.pexels.com/photos/8108310/pexels-photo-8108310.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[min(68vh,620px)] min-h-[420px] w-full overflow-hidden bg-muted sm:h-[60vh]">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1600'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-narrow">
              <div className="max-w-xl pb-8 sm:pb-0">
                <h1 className="font-display mb-3 text-4xl font-bold leading-[1.05] text-white text-balance animate-slide-up sm:mb-4 sm:text-5xl md:text-6xl">
                  {slide.title}
                </h1>
                <p className="mb-6 max-w-md text-base leading-relaxed text-white animate-slide-up sm:mb-8 sm:text-lg">
                  {slide.subtitle}
                </p>
                <Link href={slide.href}>
                  <button className="group inline-flex min-h-[48px] items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-white/90 sm:px-8 sm:text-base">
                    {slide.cta}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
