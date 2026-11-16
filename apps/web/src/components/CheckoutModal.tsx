import React, { useState } from 'react';
import { X, CheckCircle2, QrCode, CreditCard, ShieldCheck, Ticket } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: string[];
  totalAmount: number;
  onPaymentComplete: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedSeats,
  totalAmount,
  onPaymentComplete,
}) => {
  const [step, setStep] = useState<'REVIEW' | 'PROCESSING' | 'CONFIRMED'>('REVIEW');
  const [bookingRef] = useState(`CIN-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  const [customerEmail, setCustomerEmail] = useState('guest@cinema.example');

  if (!isOpen) return null;

  const handlePay = () => {
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('CONFIRMED');
      onPaymentComplete();
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        width: '460px',
        padding: '28px',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        color: '#fff',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {step === 'REVIEW' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CreditCard size={20} color="var(--accent-gold)" />
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                Review & Checkout
              </h2>
            </div>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Seats held for your session. Complete payment to issue digital tickets.
            </p>

            {/* Booking Details Card */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                Cosmic Odyssey: 3D Experience (IMAX 3D)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Apex Grand Cinema • Auditorium 1 • Friday, Nov 20 • 7:30 PM
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Reserved Seats</span>
                  <span style={{ fontWeight: 700 }}>{selectedSeats.join(', ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Ticket Subtotal</span>
                  <span>${totalAmount}.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
                  <span>Taxes & 3D Glasses</span>
                  <span>$0.00</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '10px',
                  fontWeight: 800,
                  fontSize: '17px',
                  color: 'var(--accent-gold)',
                }}>
                  <span>Total Due</span>
                  <span>${totalAmount}.00</span>
                </div>
              </div>
            </div>

            {/* Customer Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Digital Ticket Delivery Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              style={{
                width: '100%',
                backgroundColor: 'var(--accent-gold)',
                color: '#000',
                fontWeight: 800,
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={18} />
              <span>Confirm & Pay ${totalAmount}.00</span>
            </button>
          </div>
        )}

        {step === 'PROCESSING' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              Processing Transaction...
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Verifying payment authorization and locking seats permanently.
            </p>
          </div>
        )}

        {step === 'CONFIRMED' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800 }}>
              Booking Confirmed!
            </h2>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--accent-gold)',
              letterSpacing: '1px',
              marginBottom: '16px',
            }}>
              {bookingRef}
            </div>

            {/* QR Code Ticket */}
            <div style={{
              backgroundColor: '#fff',
              color: '#000',
              padding: '16px',
              borderRadius: '8px',
              display: 'inline-block',
              marginBottom: '18px',
            }}>
              <QrCode size={120} />
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Seats: <span style={{ color: '#fff', fontWeight: 700 }}>{selectedSeats.join(', ')}</span> • Confirmation sent to {customerEmail}
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: '#fff',
                fontWeight: 700,
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Ticket size={16} />
              <span>Done / View Tickets</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
