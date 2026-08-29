import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets } from '../services/ticketService';
import './SupportTickets.css';

function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTickets().then(setTickets).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-loading">Loading your tickets...</p>;

  return (
    <div className="support-page">
      <div className="support-page__header">
        <div>
          <h1>Support Tickets</h1>
          <p>Track and manage your support requests.</p>
        </div>
        <Link to="/support/new" className="dashboard__cta">+ New Ticket</Link>
      </div>

      {tickets.length === 0 ? (
        <div className="dashboard__empty">
          <p>You haven't raised any support tickets yet.</p>
          <Link to="/support/new">Create your first ticket →</Link>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <Link key={ticket._id} to={`/support/${ticket._id}`} className="ticket-card">
              <div className="ticket-card__top">
                <span className={`pill pill--status-${ticket.status.replace('_', '-')}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className="ticket-card__date">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
              </div>
              <h3>{ticket.subject}</h3>
              <p className="ticket-card__preview">
                {ticket.messages[ticket.messages.length - 1]?.message}
              </p>
              <span className="ticket-card__count">{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SupportTickets;