'use client';

import {
  RefreshCw,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

const steps = [
  {
    icon: MessageCircle,
    title: 'Contact Us',
    description: 'Message us on WhatsApp or email within 7 days of receiving your order with your order number and reason for return.',
  },
  {
    icon: Package,
    title: 'Pack the Item',
    description: 'Pack the item in its original condition with all tags attached. Include the original packaging if possible.',
  },
  {
    icon: Truck,
    title: 'Ship It Back',
    description: 'We\'ll arrange a pickup or provide you with the return address. Return shipping is free for defective items.',
  },
  {
    icon: RefreshCw,
    title: 'Refund or Exchange',
    description: 'Once we receive and inspect the item, we\'ll process your refund within 5–7 business days or ship your exchange.',
  },
];

const eligibleItems = [
  'Unworn, unwashed items with original tags',
  'Items in original packaging',
  'Defective or damaged products',
  'Wrong size or color received',
  'Requests made within 7 days of delivery',
];

const nonEligibleItems = [
  'Sale or clearance items',
  'Undergarments and accessories',
  'Custom or altered pieces',
  'Items worn, washed, or damaged by customer',
  'Requests made after 7 days of delivery',
];

export default function ReturnsPage() {
  return (
    <div className="container-narrow py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <RefreshCw className="h-4 w-4" />
          Returns & Exchanges
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-balance">
          Hassle-Free Returns
        </h1>
        <p className="text-lg text-muted-foreground text-balance">
          Not quite right? No worries. We offer a 7-day return and exchange policy on all
          non-sale items. Your satisfaction is our priority.
        </p>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        <div className="border rounded-xl p-6 bg-card text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-1">7 Days</h3>
          <p className="text-sm text-muted-foreground">Return window from delivery date</p>
        </div>
        <div className="border rounded-xl p-6 bg-card text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <RefreshCw className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-1">Free Exchange</h3>
          <p className="text-sm text-muted-foreground">Free shipping on size exchanges</p>
        </div>
        <div className="border rounded-xl p-6 bg-card text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-1">5–7 Days</h3>
          <p className="text-sm text-muted-foreground">Refund processing time</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">How Returns Work</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A simple 4-step process to make returns and exchanges easy.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="border rounded-xl p-6 bg-card h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-display text-3xl font-bold text-muted/40">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Eligibility */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Eligible */}
        <div className="border rounded-xl p-6 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-display text-xl font-bold">Eligible for Return</h3>
          </div>
          <ul className="space-y-3">
            {eligibleItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Not Eligible */}
        <div className="border rounded-xl p-6 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-display text-xl font-bold">Not Eligible</h3>
          </div>
          <ul className="space-y-3">
            {nonEligibleItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Refund Details */}
      <div className="border rounded-xl p-6 md:p-8 bg-card mb-16">
        <h2 className="font-display text-2xl font-bold mb-6">Refund Details</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Refund Method</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Refunds are issued to your original payment method (bank transfer, JazzCash,
                EasyPaisa) or as store credit. COD orders receive store credit or bank transfer.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Processing Time</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once we receive and inspect your return, refunds are processed within 5–7 business
                days. You&apos;ll receive a confirmation message once it&apos;s done.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Shipping Costs</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Original shipping charges are non-refundable. Return shipping is free for defective
                or wrong items. For all other returns, a flat Rs 200 shipping fee applies.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">4</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Exchanges</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Exchanges for a different size or color of the same product are free. If you&apos;d
                like a different product entirely, we&apos;ll process it as a return and new order.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
        <h2 className="font-display text-3xl font-bold mb-3">Need to Start a Return?</h2>
        <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
          Reach out to us with your order number and we&apos;ll guide you through the process.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/923101533429"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-primary-foreground text-primary px-6 py-3 text-sm font-medium hover:bg-primary-foreground/90 transition-colors"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp Us
          </a>
          <a
            href="mailto:touseefurrehman5554@gmail.com"
            className="inline-flex items-center justify-center rounded-md border border-primary-foreground/30 text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}
