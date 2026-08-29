import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTicketById, addTicketMessage } from '../services/ticketService';
import './SupportTickets.css';

function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const data = await getTicketById(id);
      setTicket(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages?.length]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const updated = await addTicketMessage(id, reply.trim());
      setTicket(updated);
      setReply('');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="page-loading">Loading ticket...</p>;
  if (!ticket) return <p className="page-error">Ticket not found</p>;

  const isClosed = ['resolved', 'closed'].includes(ticket.status);

  return (
    <div className="support-page" style={{ maxWidth: '700px' }}>
      <Link to="/support" className="add-product__back">← Back to tickets</Link>

      <div className="ticket-detail__header">
        <div>
          <h1>{ticket.subject}</h1>
          <p className="ticket-card__date">Opened {new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={`pill pill--status-${ticket.status.replace('_', '-')}`}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>

      <div className="ticket-thread">
        {ticket.messages.map((msg, i) => (
          <div key={i} className={`ticket-message ${msg.senderRole === 'admin' ? 'ticket-message--staff' : 'ticket-message--mine'}`}>
            <div className="ticket-message__meta">
              <strong>{msg.senderRole === 'admin' ? 'VastMart Support' : msg.senderName}</strong>
              <span>{new Date(msg.createdAt).toLocaleString()}</span>
            </div>
            <p>{msg.message}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {isClosed ? (
        <p className="ticket-detail__closed-note">
          This ticket is {ticket.status}. Sending a new message will reopen it.
        </p>
      ) : null}

      <form onSubmit={handleReply} className="ticket-reply-form">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          rows={3}
          required
        />
        <button type="submit" disabled={sending} className="dashboard__cta">
          {sending ? 'Sending...' : 'Send Reply'}
        </button>
      </form>
    </div>
  );
}

export default TicketDetail;