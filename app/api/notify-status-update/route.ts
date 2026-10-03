import { NextResponse } from 'next/server';

interface StatusUpdateRequest {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  totalAmount: number;
}

export async function POST(req: Request) {
  try {
    const { orderNumber, customerName, customerEmail, newStatus, totalAmount }: StatusUpdateRequest = await req.json();

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'inquiries@zielstore.com';

    if (!apiKey || !customerEmail) {
      return NextResponse.json({ success: false, reason: 'Missing credentials or recipient email' });
    }

    let statusHeader = 'Order Update';
    let statusDescription = `Your order <strong>${orderNumber}</strong> has been updated to <strong>${newStatus}</strong>.`;

    if (newStatus === 'Dispatched') {
      statusHeader = 'Your Order is on the Way!';
      statusDescription = `Good news! Your order <strong>${orderNumber}</strong> has been carefully packed and dispatched with our courier partner. You will receive a direct delivery contact on your phone shortly.`;
    } else if (newStatus === 'Delivered') {
      statusHeader = 'Order Delivered';
      statusDescription = `Your order <strong>${orderNumber}</strong> has been successfully delivered. We hope you enjoy your artisanal King Coconut Wine and handcrafted formulations.`;
    } else if (newStatus === 'Cancelled') {
      statusHeader = 'Order Cancelled';
      statusDescription = `Your order <strong>${orderNumber}</strong> has been cancelled. If you believe this is an error, please reply directly to this email.`;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #141413; color: #f5f5f4; margin: 0; padding: 24px; }
            .container { max-width: 580px; margin: 0 auto; background: #1c1917; border: 1px solid #292524; border-radius: 16px; padding: 32px; }
            .brand { font-size: 14px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #d97706; margin-bottom: 20px; font-family: monospace; }
            h1 { font-size: 20px; font-weight: 500; margin-top: 0; margin-bottom: 12px; color: #fafaf9; }
            .desc { font-size: 13px; color: #d6d3d1; line-height: 1.6; margin-bottom: 24px; }
            .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; background-color: #d97706; color: #0c0a09; font-family: monospace; margin-bottom: 20px; }
            .meta { font-family: monospace; font-size: 12px; border-top: 1px solid #292524; padding-top: 16px; color: #a8a29e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">Ziel Store</div>
            <div class="badge">${newStatus}</div>
            <h1>${statusHeader}</h1>
            <p class="desc">${statusDescription}</p>
            <div class="meta">
              <div>Order Reference: ${orderNumber}</div>
              <div>Billed Amount: $${Number(totalAmount).toFixed(2)}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const brevoPayload = {
      sender: { name: 'Ziel Store Support', email: senderEmail },
      to: [{ email: customerEmail, name: customerName }],
      subject: `Order Update [${orderNumber}]: ${newStatus}`,
      htmlContent: emailHtml,
    };

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    return NextResponse.json({ success: true, message: 'Status notification dispatched' });
  } catch (error: any) {
    console.error('Status notification error:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}