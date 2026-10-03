import { NextResponse } from 'next/server';

interface OrderNotifyRequest {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  city: string;
  shippingZone: string;
  paymentMethod: string;
  totalAmount: number;
  items: { name: string; qty: number; price: number }[];
  receiptUrl?: string | null;
}

export async function POST(req: Request) {
  try {
    const body: OrderNotifyRequest = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('Telegram bot credentials missing. Skipping notification.');
      return NextResponse.json({ success: false, reason: 'Credentials not configured' });
    }

    const itemsSummary = body.items
      .map((item) => `• ${item.qty}x ${item.name} ($${(item.price * item.qty).toFixed(2)})`)
      .join('\n');

    const message = `
🛍 *NEW ORDER RECEIVED!*
━━━━━━━━━━━━━━━━━━
*Order ID:* \`${body.orderNumber}\`
*Total Amount:* *$${body.totalAmount.toFixed(2)}*
*Payment:* ${body.paymentMethod}

👤 *Customer:* ${body.customerName}
📞 *Phone:* \`${body.phone}\`
📍 *City / Region:* ${body.city} (${body.shippingZone})
${body.customerEmail ? `✉️ *Email:* ${body.customerEmail}\n` : ''}
📦 *Items Ordered:*
${itemsSummary}

${
  body.receiptUrl
    ? `📎 *Bank Slip:* [View Attached Receipt](${body.receiptUrl})`
    : 'ℹ️ _No deposit slip attached (COD / Card)_'
}
━━━━━━━━━━━━━━━━━━
👉 [Open Admin Dashboard](https://ziel-store-nprl.vercel.app/admin)
`;

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      }
    );

    if (!telegramRes.ok) {
      const errData = await telegramRes.json();
      console.error('Telegram API error:', errData);
      return NextResponse.json({ success: false, error: errData }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Alert dispatched to Telegram' });
  } catch (error: any) {
    console.error('Failed to send Telegram alert:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}