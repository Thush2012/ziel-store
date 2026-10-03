import jsPDF from 'jspdf';

interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  city: string;
  zoneName: string;
  paymentMethod: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string | null;
  shippingFee: number;
  total: number;
}

export function generateInvoicePdf(data: InvoiceData) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background Header Bar
  doc.setFillColor(20, 20, 19);
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Header Title & Branding
  doc.setTextColor(240, 239, 234);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ZIEL STORE', 40, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(217, 119, 6); // Amber brand tone
  doc.text('ARTISANAL FERMENTATIONS & HANDCRAFTED FORMULATIONS', 40, 62);

  // Invoice Reference
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(240, 239, 234);
  doc.text('INVOICE / RECEIPT', pageWidth - 40, 45, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Reference: ${data.orderId}`, pageWidth - 40, 62, { align: 'right' });

  // Recipient & Shipping Meta Details
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED & SHIPPED TO:', 40, 125);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.customerName, 40, 140);
  if (data.customerEmail) doc.text(data.customerEmail, 40, 153);
  doc.text(data.phone, 40, data.customerEmail ? 166 : 153);
  doc.text(`${data.address}, ${data.city}`, 40, data.customerEmail ? 179 : 166);
  doc.text(`Region / Zone: ${data.zoneName}`, 40, data.customerEmail ? 192 : 179);

  // Payment Details (Right Column)
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS:', 340, 125);

  doc.setFont('helvetica', 'normal');
  doc.text(`Method: ${data.paymentMethod}`, 340, 140);
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 340, 153);
  doc.text(`Origin: Katunayake, Sri Lanka`, 340, 166);
  if (data.couponCode) {
    doc.text(`Voucher Applied: ${data.couponCode}`, 340, 179);
  }

  // Itemized Table Header
  const tableStartY = 220;
  doc.setFillColor(242, 239, 234);
  doc.rect(40, tableStartY, pageWidth - 80, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text('ITEM DESCRIPTION', 50, tableStartY + 16);
  doc.text('QTY', 360, tableStartY + 16, { align: 'center' });
  doc.text('UNIT PRICE', 440, tableStartY + 16, { align: 'right' });
  doc.text('TOTAL', pageWidth - 50, tableStartY + 16, { align: 'right' });

  // Item Rows
  let currentY = tableStartY + 40;
  doc.setFont('helvetica', 'normal');

  data.items.forEach((item) => {
    doc.text(item.name, 50, currentY);
    doc.text(item.qty.toString(), 360, currentY, { align: 'center' });
    doc.text(`$${Number(item.price).toFixed(2)}`, 440, currentY, { align: 'right' });
    doc.text(`$${(item.price * item.qty).toFixed(2)}`, pageWidth - 50, currentY, { align: 'right' });

    doc.setDrawColor(230, 228, 222);
    doc.line(40, currentY + 8, pageWidth - 40, currentY + 8);
    currentY += 26;
  });

  // Financial Summary Breakdown
  currentY += 15;
  const summaryX = pageWidth - 50;

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX - 90, currentY);
  doc.text(`$${Number(data.subtotal).toFixed(2)}`, summaryX, currentY, { align: 'right' });

  if (data.discountAmount && data.discountAmount > 0) {
    currentY += 18;
    doc.setTextColor(16, 185, 129); // Emerald tone
    doc.text(`Discount (${data.couponCode || 'Voucher'}):`, summaryX - 90, currentY);
    doc.text(`-$${Number(data.discountAmount).toFixed(2)}`, summaryX, currentY, { align: 'right' });
    doc.setTextColor(40, 40, 40);
  }

  currentY += 18;
  doc.text('Logistics / Freight:', summaryX - 90, currentY);
  doc.text(`$${Number(data.shippingFee).toFixed(2)}`, summaryX, currentY, { align: 'right' });

  currentY += 20;
  doc.setDrawColor(30, 30, 30);
  doc.line(summaryX - 120, currentY - 8, summaryX, currentY - 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Billed:', summaryX - 90, currentY + 6);
  doc.text(`$${Number(data.total).toFixed(2)}`, summaryX, currentY + 6, { align: 'right' });

  // Footer Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Thank you for your order. For inquiries or batch authenticity verification, visit zielstore.com/verify.',
    pageWidth / 2,
    pageHeight - 35,
    { align: 'center' }
  );

  doc.save(`Ziel_Invoice_${data.orderId}.pdf`);
}