import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, sendAdminOrderAlert, type OrderEmailData } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body: OrderEmailData = await req.json();

    if (!body.orderId || !body.items?.length) {
      return NextResponse.json({ error: 'Missing required order data' }, { status: 400 });
    }

    // Fire both emails in parallel — customer confirmation + admin alert
    const results = await Promise.allSettled([
      body.customerEmail ? sendOrderConfirmationEmail(body) : Promise.resolve(),
      sendAdminOrderAlert(body),
    ]);

    const errors = results
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason?.message);

    if (errors.length === 2) {
      // Both failed
      console.error('Email send failed:', errors);
      return NextResponse.json({ error: 'Failed to send emails', details: errors }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      customerEmailSent: results[0].status === 'fulfilled',
      adminEmailSent: results[1].status === 'fulfilled',
    });
  } catch (err: any) {
    console.error('Email route error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
