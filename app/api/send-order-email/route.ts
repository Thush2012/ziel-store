import { NextResponse } from 'next/server';

interface OrderItemPayload {
  name: string;
  qty: number;
  price: number;
}

interface OrderEmailRequest {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  city: string;
  shippingZone: string;
  paymentMethod: string;
  items: OrderItemPayload[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  receiptUrl?: string | null;
}

export async function POST(req: Request) {
  try {
    const body: OrderEmailRequest = await req.json();

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'inquiries@zielstore.com';
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'thushanmanusha345@gmail.com';

    if (!apiKey) {
      console.warn('BREVO_API_KEY is not defined. Email dispatch bypassed.');
      return NextResponse.json({ success: false, error: 'Brevo API key missing' }, { status: 500 });
    }

    // Build the line items HTML table rows
    const itemsTableHtml = body.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #292524;">
          <td style="padding: 10px 0; color: #f5f5f4;">${item.name}</td>
          <td style="padding: 10px 0; text-align: center; color: #a8a29e;">${item.qty}</td>
          <td style="padding: 10px 0; text-align: right; color: #f5f5f4;">$${(item.price * item.qty).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    // Shared HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #141413; color: #f5f5f4; margin: 0; padding: 24px; }
            .container { max-width: 600px; margin: 0 auto; background: #1c1917; border: 1px solid #292524; border-radius: 16px; padding: 32px; }
            .brand { font-size: 16px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #d97706; margin-bottom: 24px; }
            h1 { font-size: 20px; font-weight: 400; margin-top: 0; margin-bottom: 8px; color: #fafaf9; }
            .subtext { font-size: 13px; color: #a8a29e; line-height: 1.5; margin-bottom: 24px; }
            .card { background: #292524; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 12px; font-family: monospace; }
            .card-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
            th { text-align: left; padding-bottom: 8px; border-bottom: 1px solid #44403c; color: #a8a29e; font-size: 11px; text-transform: uppercase; font-family: monospace; }
            .summary { margin-top: 16px; padding-top: 16px; border-top: 1px solid #44403c; font-size: 13px; font-family: monospace; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 4px; color: #a8a29e; }
            .total { font-size: 16px; font-weight: 700; color: #fafaf9; margin-top: 8px; }
            .button { display: inline-block; background-color: #d97706; color: #0c0a09; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">Ziel Store</div>
            <h1>Order Confirmed: ${body.orderNumber}</h1>
            <p class="subtext">
              Thank you, <strong>${body.customerName}</strong>. Your order is registered and queued for dispatch.
            </p>

            <div class="card">
              <div style="margin-bottom: 6px;"><strong>Delivery Destination:</strong> ${body.shippingZone}</div>
              <div style="margin-bottom: 6px;"><strong>Address:</strong> ${body.address}, ${body.city}</div>
              <div style="margin-bottom: 6px;"><strong>Contact Phone:</strong> ${body.phone}</div>
              <div><strong>Payment Method:</strong> ${body.paymentMethod}</div>
              ${
                body.receiptUrl
                  ? `<div style="margin-top: 10px;"><a href="${body.receiptUrl}" style="color: #fbbf24; text-decoration: underline;" target="_blank">View Bank Deposit Slip Attachment</a></div>`
                  : ''
              }
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTableHtml}
              </tbody>
            </table>

            <div class="summary">
              <table style="width: 100%; border: none; margin: 0;">
                <tr><td style="color: #a8a29e;">Subtotal:</td><td style="text-align: right; color: #a8a29e;">$${body.subtotal.toFixed(2)}</td></tr>
                <tr><td style="color: #a8a29e;">Shipping:</td><td style="text-align: right; color: #a8a29e;">$${body.shippingFee.toFixed(2)}</td></tr>
                <tr style="border-top: 1px solid #44403c;"><td class="total">Total:</td><td class="total" style="text-align: right;">$${body.totalAmount.toFixed(2)}</td></tr>
              </table>
            </div>

            <p style="font-size: 11px; color: #78716c; margin-top: 32px; border-top: 1px solid #292524; padding-top: 16px;">
              © ${new Date().getFullYear()} Ziel Store • Artisanal King Coconut Fermentations & Handcrafted Formulations
            </p>
          </div>
        </body>
      </html>
    `;

    // 1. Dispatch notification to Admin
    const adminMailPayload = {
      sender: { name: 'Ziel Store Notifications', email: senderEmail },
      to: [{ email: adminEmail, name: 'Ziel Admin' }],
      subject: `🚨 New Order ${body.orderNumber} ($${body.totalAmount.toFixed(2)}) — ${body.customerName}`,
      htmlContent: emailHtml,
    };

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminMailPayload),
    });

    // 2. Dispatch invoice to Customer (if valid email provided)
    if (body.customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) {
      const customerMailPayload = {
        sender: { name: 'Ziel Store', email: senderEmail },
        to: [{ email: body.customerEmail, name: body.customerName }],
        subject: `Your Ziel Store Order Confirmation [${body.orderNumber}]`,
        htmlContent: emailHtml,
      };

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerMailPayload),
      });
    }

    return NextResponse.json({ success: true, message: 'Emails queued successfully' });
  } catch (error: any) {
    console.error('Email Dispatch Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch email' },
      { status: 500 }
    );
  }
}