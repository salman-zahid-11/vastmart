export function getOrderId(order) {
  return order?.orderId || String(order?._id || '').slice(-8).toUpperCase();
}
