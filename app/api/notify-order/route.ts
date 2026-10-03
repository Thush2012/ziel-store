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

    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

    if (!botToken || !chatId) {
      console.warn('Telegram credentials missing in environment.');
      return NextResponse.json({ success: false, reason: 'Credentials not configured' });
    }

    const itemsSummary = (body.items || [])
      .map((item) => `• <b>${item.qty}x</b> ${item.name} ($${(item.price * item.qty).toFixed(2)})`)
      .join('\n');

    const message = `
🛍 <b>NEW ORDER RECEIVED!</b>
━━━━━━━━━━━━━━━━━━
<b>Order ID:</b> <code>${body.orderNumber}</code>
<b>Total Billed:</b> <b>$${Number(body.totalAmount).toFixed(2)}</b>
<b>Payment Method:</b> ${body.paymentMethod}

👤 <b>Customer:</b> ${body.customerName}
📞 <b>Phone:</b> <code>${body.phone}</code>
📍 <b>Destination:</b> ${body.city} (${body.shippingZone})
${body.customerEmail ? `✉️ <b>Email:</b> ${body.customerEmail}\n` : ''}
📦 <b>Items Ordered:</b>
${itemsSummary}

${
  body.receiptUrl
    ? `📎 <b>Deposit Slip:</b> <a href="${body.receiptUrl}">Click to View Slip</a>`
    : 'ℹ️ <i>No slip attached (COD / Card)</i>'
}
━━━━━━━━━━━━━━━━━━
👉 <a href="https://ziel-store-nprl.vercel.app/admin">Open Admin Portal</a>
`;

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      }
    );

    const tgData = await telegramRes.json();

    if (!telegramRes.ok) {
      console.error('Telegram API Error Response:', tgData);
      return NextResponse.json({ success: false, error: tgData }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Telegram alert sent!' });
  } catch (error: any) {
    console.error('Failed to dispatch Telegram notification:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}