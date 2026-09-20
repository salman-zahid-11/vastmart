import { getOrderId } from './getOrderId';

export function generateOrderWhatsAppMessage(order) {
  const addr = order.shippingAddress;

  const itemLines = order.items
    .map((item) => `• ${item.name} × ${item.quantity} — ৳${item.price * item.quantity}`)
    .join('\n');

  const message = `🛍️ *NEW VASTMART ORDER*

Hello VastMart team,
I would like to place the following order:

*Order ID:* #${getOrderId(order)}

*CUSTOMER DETAILS*
Name: ${addr.fullName}
Phone: ${addr.phone}
${addr.alternatePhone ? `Alternate phone: ${addr.alternatePhone}\n` : ''}Email: ${addr.email}

*ORDER ITEMS*
${itemLines}

*ORDER SUMMARY*
Subtotal: ৳${order.itemsTotal}
${order.discountAmount > 0 ? `Discount: -৳${order.discountAmount}\n` : ''}Delivery charge: ৳${order.shippingFee}
*Grand total: ৳${order.totalAmount}*

Payment method: ${order.paymentMethod.replace('_', ' ').toUpperCase()}

*DELIVERY ADDRESS*
${addr.label ? `Address type: ${addr.label}\n` : ''}${addr.street}
${addr.thana ? `Thana: ${addr.thana}\n` : ''}${addr.upazila ? `Upazila: ${addr.upazila}\n` : ''}District: ${addr.city}
${addr.postalCode ? `Postal code: ${addr.postalCode}\n` : ''}Country: ${addr.country}
${addr.deliveryNotes ? `\n*Note:* ${addr.deliveryNotes}` : ''}

Please confirm my order and share the next steps.
Thank you, VastMart!`;

  return encodeURIComponent(message);
}