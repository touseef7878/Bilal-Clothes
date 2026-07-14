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
    <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-muted">
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
              <div className="max-w-lg">
                <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 text-balance animate-slide-up">
                  {slide.title}
                </h1>
                <p className="text-lg text-white/80 mb-8 animate-slide-up">
                  {slide.subtitle}
                </p>
                <Link href={slide.href}>
                  <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-foreground rounded-md font-semibold hover:bg-white/90 transition-all group">
                    {slide.cta}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
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
