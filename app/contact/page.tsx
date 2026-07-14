'use client';

import { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, Store, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const contactInfo = [
  {
    icon: Phone,
    title: 'Call Us',
    value: '+92 310 1533429',
    subtext: 'Mon–Sat, 9am–9pm',
    href: 'tel:+923101533429',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: '+92 310 1533429',
    subtext: 'Fastest response — In sha\'Allah',
    href: 'https://wa.me/923101533429',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'touseefurrehman5554@gmail.com',
    subtext: 'We reply within 24 hours',
    href: 'mailto:touseefurrehman5554@gmail.com',
  },
  {
    icon: Instagram,
    title: 'Instagram',
    value: '@touseef__r',
    subtext: 'Follow our latest arrivals',
    href: 'https://instagram.com/touseef__r',
  },
];

const businessHours = [
  { day: 'Monday – Saturday', hours: '9:00 AM – 9:00 PM' },
  { day: 'Friday', hours: '12:30 PM – 9:00 PM (Jumu\'ah break)' },
  { day: 'Sunday', hours: '2:00 PM – 8:00 PM' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="container-narrow py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="font-display text-xl text-primary mb-2">السَّلَامُ عَلَيْكُمْ</p>
        <p className="text-sm text-muted-foreground italic mb-6">Peace be upon you</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-balance">
          Get in Touch
        </h1>
        <p className="text-lg text-muted-foreground text-balance">
          Have a question about an order, a product, or just want to say salaam?
          We'd love to hear from you. Reach out through any of the channels below.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {contactInfo.map((info) => (
          <a
            key={info.title}
            href={info.href}
            target={info.href.startsWith('http') ? '_blank' : undefined}
            rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="border rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition-all bg-card group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <info.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm mb-1">{info.title}</h3>
            <p className="text-sm font-medium mb-0.5">{info.value}</p>
            <p className="text-xs text-muted-foreground">{info.subtext}</p>
          </a>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Send Us a Message</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Fill out the form below and we'll get back to you as soon as possible, In sha'Allah.
          </p>

          {submitted ? (
            <div className="border border-primary/30 bg-primary/5 rounded-xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Send className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Message Sent — Alhamdulillah!</h3>
              <p className="text-sm text-muted-foreground">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+92 310 1533429" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="How can we help you?"
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          )}
        </div>

        {/* Business Hours & Map */}
        <div className="space-y-8">
          {/* Business Hours */}
          <div className="border rounded-xl p-6 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold">Business Hours</h2>
            </div>
            <div className="space-y-3">
              {businessHours.map((item) => (
                <div key={item.day} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{item.day}</span>
                  <span className="font-medium">{item.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground">
                Orders placed after 6 PM are processed the next business day. WhatsApp support
                available extended hours.
              </p>
            </div>
          </div>

          {/* Map */}
          <div id="map" className="border rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps?q=Mughal+Market,+Taxila,+Punjab,+Pakistan&output=embed"
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bilal Clothes — Mughal Market, Taxila"
            />
            <div className="p-4 flex items-center justify-between bg-card">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4 text-primary" />
                <span className="font-medium">Bilal Clothes — Mughal Market, Taxila</span>
              </div>
              <a
                href="https://maps.google.com/?q=Mughal+Market+Taxila+Punjab+Pakistan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Get Directions →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
