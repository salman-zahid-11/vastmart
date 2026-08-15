import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p style={{ padding: '30px' }}>Loading your orders...</p>;
  if (error) return <p style={{ padding: '30px', color: 'red' }}>{error}</p>;

  if (orders.length === 0) {
    return (
      <div style={{ padding: '30px' }}>
        <h2>My Orders</h2>
        <p>You haven't placed any orders yet.</p>
        <Link to="/">Start shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px' }}>
      <h2>My Orders</h2>

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
              <p style={{ margin: '4px 0', color: '#888', fontSize: '14px' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  textTransform: 'capitalize',
                  backgroundColor:
                    order.orderStatus === 'delivered'
                      ? '#d4edda'
                      : order.orderStatus === 'cancelled'
                      ? '#f8d7da'
                      : '#fff3cd',
                  color: '#333',
                }}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>

          {order.items.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0' }}>
              <span>{item.name} × {item.quantity}</span>
              <span>৳{item.price * item.quantity}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>৳{order.totalAmount}</span>
          </div>

          <Link to={`/order-confirmation/${order._id}`} style={{ fontSize: '14px' }}>
            View details
          </Link>
        </div>
      ))}
    </div>
  );
}

export default OrderHistory;