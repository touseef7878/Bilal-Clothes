'use client';

import { Sparkles, Heart, Leaf, Handshake, Scissors, Truck, ShieldCheck, MapPin, Phone, MessageCircle, Instagram } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Crafted with Ikhlas',
    description: 'Every piece is made with sincere dedication by skilled artisans who take pride in their craft — بِسْمِ اللَّهِ.',
  },
  {
    icon: Leaf,
    title: 'Quality Fabrics',
    description: 'We source only the finest fabrics — from breathable lawn to luxurious cotton — ensuring comfort and durability, In sha\' Allah.',
  },
  {
    icon: Handshake,
    title: 'Fair Trade',
    description: 'We partner directly with local artisans and mills, ensuring fair wages and supporting our Pakistani brothers and sisters.',
  },
  {
    icon: Scissors,
    title: 'Timeless Design',
    description: 'Our designs blend traditional Pakistani aesthetics with modern silhouettes — honoring our heritage while embracing the future.',
  },
];

const milestones = [
  { year: '2019', title: 'The Beginning — بِسْمِ اللَّهِ', description: 'Bilal Clothes started as a small shop in Mughal Market, Taxila, with a dream to bring quality clothing to our community.' },
  { year: '2021', title: 'Going Online — Alhamdulillah', description: 'Launched our online store, reaching customers across all of Pakistan with the blessing of Allah.' },
  { year: '2023', title: 'Growing Trust — Mashallah', description: 'Served thousands of happy customers nationwide, building a reputation for quality and honesty.' },
  { year: '2025', title: 'New Collections — Subhanallah', description: 'Expanded our range with premium formal wear and seasonal lawn collections for every occasion.' },
];

export default function AboutPage() {
  return (
    <div className="container-narrow py-12 animate-fade-in">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          Our Story
        </div>
        <div className="mb-6">
          <p className="font-display text-2xl text-primary mb-2">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <p className="text-sm text-muted-foreground italic">In the name of Allah, the Most Gracious, the Most Merciful</p>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-balance">
          Bilal Clothes — Tradition, Trust & Quality
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed text-balance">
          Born in the historic city of Taxila, Bilal Clothes was founded with a simple mission:
          to bring premium Pakistani clothing to every home with honesty, quality, and care.
          We believe that good clothing is a blessing, and we deliver it with that spirit.
        </p>
      </div>

      {/* Brand Story */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
          <img
            src="https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Bilal Clothes craftsmanship"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="font-display text-3xl font-bold">From Taxila, with Love</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              It started in Mughal Market, Taxila — a city steeped in history and culture.
              Our founder, Tousseef Ur Rehman, saw a need for quality, affordable clothing
              in his community. What began as a small shop has grown into a trusted brand
              serving customers across Pakistan.
            </p>
            <p>
              <span className="font-medium text-foreground">"And He found you lost and guided you."</span>
              <span className="text-sm block mt-1 italic">— Surah Ad-Duha, 93:7</span>
            </p>
            <p>
              Today, Bilal Clothes works with skilled artisans across the country, delivering
              premium kurtas, lawn suits, and formal wear at honest prices. Every stitch carries
              our commitment to quality and every delivery carries our gratitude.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 mb-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed mb-6">
            To make premium Pakistani fashion accessible to everyone — celebrating our heritage,
            supporting local artisans, and delivering quality that speaks for itself.
            We work with the belief that honesty and hard work are rewarded by Allah.
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <span className="text-sm font-medium">Nationwide Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              <span className="text-sm font-medium">Artisan Supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">What We Stand For</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The values that guide every stitch, every fabric choice, and every delivery.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="border rounded-xl p-6 hover:shadow-md transition-shadow bg-card"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Our Journey</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From a small shop in Taxila to a brand worn across Pakistan — Alhamdulillah.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative flex items-start gap-6 md:gap-0 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-background -translate-x-1/2 mt-2" />
                <div className="pl-12 md:pl-0 md:w-1/2 md:px-8">
                  <div className="border rounded-xl p-6 bg-card">
                    <span className="inline-block text-sm font-bold text-primary mb-2">
                      {milestone.year}
                    </span>
                    <h3 className="font-display text-lg font-semibold mb-2">{milestone.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visit Our Shop */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Visit Our Shop</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We'd love to see you in person — come say Salaam at our shop in Taxila!
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-xl p-6 space-y-4">
            <h3 className="font-display text-xl font-bold">Bilal Clothes</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Mughal Market, Taxila</p>
                  <p className="text-muted-foreground">Punjab, Pakistan</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:+923101533429" className="hover:text-primary">+92 310 1533429</a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                <a href="https://wa.me/923101533429" target="_blank" rel="noopener noreferrer" className="hover:text-primary">WhatsApp: +92 310 1533429</a>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-primary shrink-0" />
                <a href="https://instagram.com/touseef__r" target="_blank" rel="noopener noreferrer" className="hover:text-primary">@touseef__r</a>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Business Hours</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Monday – Saturday: 9:00 AM – 9:00 PM</p>
                <p>Friday: 12:30 PM – 9:00 PM (Jumu\'ah break)</p>
                <p>Sunday: 2:00 PM – 8:00 PM</p>
              </div>
            </div>
          </div>
          <div className="border rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps?q=Mughal+Market,+Taxila,+Punjab,+Pakistan&output=embed"
              width="100%"
              height="100%"
              style={{ minHeight: '350px', border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bilal Clothes Location — Mughal Market, Taxila"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center border-t pt-16">
        <p className="font-display text-2xl text-primary mb-3">جَزَاكَ اللَّهُ خَيْرًا</p>
        <p className="text-sm text-muted-foreground italic mb-6">May Allah reward you with goodness</p>
        <h2 className="font-display text-3xl font-bold mb-3">Join the Bilal Clothes Family</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Discover clothing that celebrates tradition while fitting your modern life.
        </p>
        <a
          href="/women"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Explore Collections
        </a>
      </div>
    </div>
  );
}
