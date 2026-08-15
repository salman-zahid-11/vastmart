import jsPDF from 'jspdf';

export function generateReceiptPDF(order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const addr = order.shippingAddress;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 50;
  let y = 60;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(91, 61, 245); // brand violet
  doc.text('VastMart', margin, y);

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Order Receipt', pageWidth - margin, y, { align: 'right' });

  y += 10;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 30;

  // Order meta
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Order ID', margin, y);
  doc.text('Date', margin + 200, y);
  doc.text('Payment', margin + 350, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  y += 16;
  doc.text(`#${order._id.slice(-8).toUpperCase()}`, margin, y);
  doc.text(new Date(order.createdAt).toLocaleDateString('en-GB'), margin + 200, y);
  doc.text(order.paymentMethod.replace('_', ' ').toUpperCase(), margin + 350, y);

  y += 40;

  // Ship to
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Shipping To', margin, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  [
    addr.fullName,
    addr.email,
    addr.street,
    `${addr.city}${addr.postalCode ? ', ' + addr.postalCode : ''}`,
    addr.country,
    addr.phone,
  ].forEach((line) => {
    doc.text(line, margin, y);
    y += 14;
  });

  y += 20;

  // Items table header
  doc.setFillColor(245, 243, 255);
  doc.rect(margin, y, pageWidth - margin * 2, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.text('Item', margin + 10, y + 16);
  doc.text('Qty', margin + 300, y + 16);
  doc.text('Price', margin + 360, y + 16);
  doc.text('Amount', pageWidth - margin - 10, y + 16, { align: 'right' });
  y += 24;

  // Items rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  order.items.forEach((item) => {
    y += 22;
    doc.text(item.name, margin + 10, y);
    doc.text(String(item.quantity), margin + 300, y);
    doc.text(`Tk ${item.price}`, margin + 360, y);
    doc.text(`Tk ${item.price * item.quantity}`, pageWidth - margin - 10, y, { align: 'right' });
  });

  y += 30;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Totals
  const totalsX = pageWidth - margin - 150;
  doc.setFontSize(10);
  doc.text('Subtotal', totalsX, y);
  doc.text(`Tk ${order.itemsTotal}`, pageWidth - margin - 10, y, { align: 'right' });
  y += 16;
  doc.text('Shipping', totalsX, y);
  doc.text(`Tk ${order.shippingFee}`, pageWidth - margin - 10, y, { align: 'right' });
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(91, 61, 245);
  doc.text('Total', totalsX, y);
  doc.text(`Tk ${order.totalAmount}`, pageWidth - margin - 10, y, { align: 'right' });

  y += 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for shopping with VastMart.', margin, y);

  doc.save(`VastMart-Receipt-${order._id.slice(-8).toUpperCase()}.pdf`);
}