import React, { useEffect, useState } from 'react';
import { X, Ticket, Calendar, MapPin, AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import { fetchMyBookings, cancelBookingApi, BookingDTO } from '../services/api';

interface MyTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  onTicketCancelled?: (seats: string[]) => void;
}

export const MyTicketsModal: React.FC<MyTicketsModalProps> = ({
  isOpen,
  onClose,
  token,
  onTicketCancelled,
}) => {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBookings();
    }
  }, [isOpen]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchMyBookings(token);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking: BookingDTO) => {
    if (!confirm(`Are you sure you want to cancel booking ${booking.booking_reference}? Seats will be released immediately.`)) {
      return;
    }

    try {
      await cancelBookingApi(booking.id, token);
      setActionMessage(`Booking ${booking.booking_reference} cancelled successfully. Seats refunded.`);
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: 'CANCELLED' } : b))
      );
      if (onTicketCancelled) {
        onTicketCancelled(booking.items.map((i) => i.seat_label));
      }
      setTimeout(() => setActionMessage(null), 4000);
    } catch {
      alert('Failed to cancel booking. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        width: '640px',
        maxWidth: '90vw',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: 'var(--accent-gold)',
              color: '#000',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
            }}>
              <Ticket size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>My Cinema Tickets</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Manage upcoming show reservations and cancellation options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action message banner */}
        {actionMessage && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderBottom: '1px solid #10b981',
            color: '#10b981',
            padding: '10px 24px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle size={16} />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Content list */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading ticket records...
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Ticket size={40} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
              <div style={{ fontSize: '15px', fontWeight: 600 }}>No Bookings Found</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Reserve tickets in 3D to see them here!</div>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: `1px solid ${b.status === 'CONFIRMED' ? 'var(--border)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  opacity: b.status === 'CANCELLED' ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{b.movie_title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <MapPin size={13} />
                      <span>{b.cinema_name} • {b.auditorium_name}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor:
                        b.status === 'CONFIRMED'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : b.status === 'PENDING'
                          ? 'rgba(234, 179, 8, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      color:
                        b.status === 'CONFIRMED'
                          ? '#10b981'
                          : b.status === 'PENDING'
                          ? '#eab308'
                          : '#ef4444',
                    }}
                  >
                    {b.status}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> Date & Time
                    </div>
                    <div style={{ fontWeight: 600, marginTop: '2px' }}>
                      {new Date(b.starts_at).toLocaleDateString()} • {new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Reserved Seats</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginTop: '2px' }}>
                      {b.items.map((i) => i.seat_label).join(', ')}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Reference ID</div>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace', marginTop: '2px' }}>
                      {b.booking_reference}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>
                    Total: ${(b.total_minor / 100).toFixed(2)} {b.currency}
                  </div>

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(b)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Ban size={14} />
                      <span>Cancel & Refund</span>
                    </button>
                  )}

                  {b.status === 'CANCELLED' && (
                    <span style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={13} />
                      Seats returned to inventory
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
