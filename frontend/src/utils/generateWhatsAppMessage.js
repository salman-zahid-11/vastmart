import { getOrderId } from './getOrderId';

export function generateOrderWhatsAppMessage(order) {
  const addr = order.shippingAddress;

  const itemLines = order.items
    .map((item) => `• ${item.name} × ${item.quantity} — ৳${item.price * item.quantity}`)
    .join('\n');

  const message = `🛍️ *New VastMart Order*

*Order ID:* #${getOrderId(order)}
*Customer:* ${addr.fullName}
*Phone:* ${addr.phone}
*Email:* ${addr.email}

*Items:*
${itemLines}

*Subtotal:* ৳${order.itemsTotal}
*Shipping:* ৳${order.shippingFee}
*Total:* ৳${order.totalAmount}

*Payment Method:* ${order.paymentMethod.replace('_', ' ').toUpperCase()}

*Delivery Address:*
${addr.street}, ${addr.thana || addr.upazila}${addr.thana && addr.upazila ? ', ' + addr.upazila : ''}, ${addr.city}${addr.postalCode ? ', ' + addr.postalCode : ''}
${addr.country}
${addr.deliveryNotes ? `\n*Note:* ${addr.deliveryNotes}` : ''}

Please confirm and arrange delivery. Thank you!`;

  return encodeURIComponent(message);
}