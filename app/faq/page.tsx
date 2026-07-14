'use client';

import { HelpCircle, Truck, CreditCard, RefreshCw, Package, Shirt, MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = [
  {
    icon: Truck,
    title: 'Orders & Delivery',
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'We deliver across Pakistan within 2–5 business days. Major cities (Lahore, Karachi, Islamabad) typically receive orders in 2–3 days, while smaller cities may take 4–5 days. You\'ll receive tracking details once your order ships.',
      },
      {
        q: 'Do you offer Cash on Delivery (COD)?',
        a: 'Yes! COD is available across Pakistan with no extra charges. Simply select "Cash on Delivery" at checkout and pay when your order arrives.',
      },
      {
        q: 'How much does shipping cost?',
        a: 'Shipping is free on all orders above Rs 5,000. For orders below Rs 5,000, a flat shipping fee of Rs 200 applies.',
      },
      {
        q: 'Can I track my order?',
        a: 'Absolutely. Once your order is shipped, you\'ll receive an SMS and email with a tracking link. You can also check your order status anytime in your account page.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Currently, we only deliver within Pakistan. We\'re working on expanding to international shipping soon — stay tuned!',
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Cash on Delivery (COD), JazzCash, EasyPaisa, bank transfer, and major debit/credit cards. All online payments are processed securely.',
      },
      {
        q: 'Is it safe to pay online?',
        a: 'Yes, your security is our priority. All online payments are encrypted and processed through secure payment gateways. We never store your card details.',
      },
      {
        q: 'Can I pay with JazzCash or EasyPaisa?',
        a: 'Yes! Select "JazzCash" or "EasyPaisa" at checkout and you\'ll be redirected to complete your payment. Once confirmed, your order is processed immediately.',
      },
      {
        q: 'Are there any hidden charges?',
        a: 'None at all. The price you see at checkout is the final price. There are no hidden fees, processing charges, or taxes added later.',
      },
    ],
  },
  {
    icon: RefreshCw,
    title: 'Returns & Exchanges',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day return and exchange policy from the date of delivery. Items must be unworn, unwashed, and have all original tags attached. Sale items are non-returnable.',
      },
      {
        q: 'How do I start a return or exchange?',
        a: 'Message us on WhatsApp at +92 310 1533429 with your order number and reason for return. We\'ll guide you through the process and arrange a pickup if needed.',
      },
      {
        q: 'Is return shipping free?',
        a: 'Return shipping is free for defective or wrong items. For all other returns, a flat Rs 200 shipping fee applies. Exchanges for a different size of the same product are free.',
      },
      {
        q: 'How long do refunds take?',
        a: 'Refunds are processed within 5–7 business days after we receive and inspect your return. Refunds are issued to your original payment method or as store credit.',
      },
    ],
  },
  {
    icon: Shirt,
    title: 'Products & Sizing',
    questions: [
      {
        q: 'How do I find the right size?',
        a: 'Check our detailed size guide page for measurement charts for both men and women. If you\'re still unsure, message us on WhatsApp with your measurements and we\'ll help you pick the perfect fit.',
      },
      {
        q: 'Are your fabrics true to color in photos?',
        a: 'We do our best to photograph products accurately, but colors may vary slightly depending on your screen settings. If you have questions about a specific color, feel free to ask us.',
      },
      {
        q: 'Do you offer alterations?',
        a: 'Yes, we offer free alterations on kameez length within 7 days of delivery. Just message us after receiving your order to arrange it.',
      },
      {
        q: 'How do I care for my clothes?',
        a: 'Most of our items are machine washable on a gentle cycle with cold water. We recommend air drying and ironing inside out. Detailed care instructions are on the label of each garment.',
      },
    ],
  },
  {
    icon: Package,
    title: 'Account & Orders',
    questions: [
      {
        q: 'Do I need an account to place an order?',
        a: 'No, you can checkout as a guest. However, creating an account lets you track orders, save addresses, and earn loyalty rewards. It\'s free and takes just a minute.',
      },
      {
        q: 'Can I modify or cancel my order?',
        a: 'You can modify or cancel your order within 2 hours of placing it. After that, the order enters processing and changes may not be possible. Contact us as soon as possible if you need to make changes.',
      },
      {
        q: 'Can I order via WhatsApp instead of the website?',
        a: 'Yes! You can order directly through WhatsApp. Send us the product name, size, and your address, and our team will help you complete the order. Great for when you\'re on the go.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container-narrow py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <HelpCircle className="h-4 w-4" />
          FAQ
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-balance">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-muted-foreground text-balance">
          Everything you need to know about shopping with Bilal Clothes. Can&apos;t find what you&apos;re
          looking for? Reach out to us anytime.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-12 mb-16">
        {faqCategories.map((category) => (
          <div key={category.title}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <category.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">{category.title}</h2>
            </div>
            <div className="border rounded-xl overflow-hidden bg-card">
              <Accordion type="single" collapsible className="px-6">
                {category.questions.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${category.title}-${index}`}
                    className={index === category.questions.length - 1 ? 'border-b-0' : ''}
                  >
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="border rounded-2xl p-8 md:p-12 text-center bg-card">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
          Still Have Questions?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Our team is here to help. Reach out and we&apos;ll get you sorted in no time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/923101533429"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat on WhatsApp
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-6 py-3 text-sm font-medium transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
