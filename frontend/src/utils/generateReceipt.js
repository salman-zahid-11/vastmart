import jsPDF from 'jspdf';
import logoUrl from '../assets/logo_vastmart.png';

async function loadLogo() {
  const response = await fetch(logoUrl);
  if (!response.ok) throw new Error('Unable to load the VastMart logo');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to prepare the VastMart logo'));
    reader.readAsDataURL(blob);
  });
}

function setOpacity(doc, opacity) {
  if (typeof doc.setGState === 'function' && typeof doc.GState === 'function') {
    doc.setGState(new doc.GState({ opacity }));
  }
}

export async function generateReceiptPDF(order) {
  const logo = await loadLogo();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const addr = order.shippingAddress;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const orderId = order._id.slice(-8).toUpperCase();
  let y = 54;

  // Subtle centered watermark behind the receipt content.
  setOpacity(doc, 0.07);
  doc.addImage(logo, 'PNG', (pageWidth - 250) / 2, 315, 250, 250);
  setOpacity(doc, 1);

  doc.addImage(logo, 'PNG', margin, y - 20, 76, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(105, 105, 105);
  doc.text('Order Receipt', pageWidth - margin, y + 2, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(135, 135, 135);
  doc.text('EVERYTHING YOU NEED, ALL IN ONE PLACE', pageWidth - margin, y + 16, { align: 'right' });

  y += 48;
  doc.setDrawColor(221, 224, 232);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 55, 65);
  doc.text('ORDER ID', margin, y);
  doc.text('DATE', margin + 200, y);
  doc.text('PAYMENT', margin + 350, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 100);
  doc.text(`#${orderId}`, margin, y);
  doc.text(new Date(order.createdAt).toLocaleDateString('en-GB'), margin + 200, y);
  doc.text((order.paymentMethod || 'cod').replace('_', ' ').toUpperCase(), margin + 350, y);
  y += 34;

  doc.setFillColor(248, 247, 255);
  doc.roundedRect(margin, y - 10, contentWidth, 92, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(55, 55, 65);
  doc.text('SHIPPING TO', margin + 14, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(85, 85, 95);
  [
    addr.fullName,
    addr.email,
    addr.street,
    `${addr.city}${addr.thana ? `, ${addr.thana}` : ''}${addr.postalCode ? `, ${addr.postalCode}` : ''}`,
    `${addr.country}  ·  ${addr.phone}`,
  ].filter(Boolean).forEach((line, index) => doc.text(line, margin + 14, y + 24 + index * 12));
  y += 112;

  doc.setFillColor(91, 61, 245);
  doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM', margin + 10, y + 16);
  doc.text('QTY', margin + 300, y + 16);
  doc.text('PRICE', margin + 360, y + 16);
  doc.text('AMOUNT', pageWidth - margin - 10, y + 16, { align: 'right' });
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 70);
  order.items.forEach((item, index) => {
    y += 24;
    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 254);
      doc.rect(margin, y - 16, contentWidth, 24, 'F');
    }
    const name = doc.splitTextToSize(item.name, 250);
    doc.text(name[0], margin + 10, y);
    doc.text(String(item.quantity), margin + 300, y);
    doc.text(`Tk ${item.price}`, margin + 360, y);
    doc.text(`Tk ${item.price * item.quantity}`, pageWidth - margin - 10, y, { align: 'right' });
  });

  y += 30;
  doc.setDrawColor(225, 226, 232);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;
  const totalsX = pageWidth - margin - 150;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 90);
  doc.text('Subtotal', totalsX, y);
  doc.text(`Tk ${order.itemsTotal}`, pageWidth - margin - 10, y, { align: 'right' });
  y += 16;
  doc.text('Shipping', totalsX, y);
  doc.text(`Tk ${order.shippingFee}`, pageWidth - margin - 10, y, { align: 'right' });
  if (order.discountAmount) {
    y += 16;
    doc.setTextColor(35, 145, 95);
    doc.text('Discount', totalsX, y);
    doc.text(`- Tk ${order.discountAmount}`, pageWidth - margin - 10, y, { align: 'right' });
  }
  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(91, 61, 245);
  doc.text('TOTAL', totalsX, y);
  doc.text(`Tk ${order.totalAmount}`, pageWidth - margin - 10, y, { align: 'right' });

  doc.setDrawColor(221, 224, 232);
  doc.line(margin, pageHeight - 62, pageWidth - margin, pageHeight - 62);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(125, 125, 135);
  doc.text('Thank you for shopping with VastMart.', margin, pageHeight - 43);
  doc.text(`Receipt #${orderId}`, pageWidth - margin, pageHeight - 43, { align: 'right' });
  doc.text('This is a computer-generated receipt.', margin, pageHeight - 29);

  doc.save(`VastMart-Receipt-${orderId}.pdf`);
}
