import React, { useEffect, useState } from 'react';
import { Clock, CreditCard, CheckCircle2 } from 'lucide-react';

interface BookingSummaryTrayProps {
  selectedSeats: string[];
  onProceedToHold: () => void;
  isHeld: boolean;
  holdExpiresInSeconds: number;
}

export const BookingSummaryTray: React.FC<BookingSummaryTrayProps> = ({
  selectedSeats,
  onProceedToHold,
  isHeld,
  holdExpiresInSeconds,
}) => {
  const [timeLeft, setTimeLeft] = useState(holdExpiresInSeconds);

  useEffect(() => {
    if (!isHeld) return;
    setTimeLeft(holdExpiresInSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isHeld, holdExpiresInSeconds]);

  // Pricing calculation
  const calculateTotal = () => {
    let total = 0;
    selectedSeats.forEach((seat) => {
      const row = seat.charAt(0);
      if (row === 'D' || row === 'E') total += 25;
      else total += 18;
    });
    return total;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '20px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: '#10b981', borderRadius: '3px' }} />
          <span>Available ($18)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: '#d97706', borderRadius: '3px' }} />
          <span>Premium ($25)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: '#3b82f6', borderRadius: '3px' }} />
          <span>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: '#f59e0b', borderRadius: '3px' }} />
          <span>Held / In Checkout</span>
        </div>
      </div>

      {/* Selected Seats & Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Selected Seats ({selectedSeats.length})
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Amount</div>
          <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--accent-gold)' }}>
            ${calculateTotal()}.00
          </div>
        </div>

        {isHeld && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1e293b',
            padding: '8px 14px',
            borderRadius: '6px',
            color: '#fbbf24',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            <Clock size={16} />
            <span>
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>
        )}

        <button
          disabled={selectedSeats.length === 0}
          onClick={onProceedToHold}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: selectedSeats.length > 0 ? 'var(--accent-gold)' : '#374151',
            color: selectedSeats.length > 0 ? '#000' : '#9ca3af',
            border: 'none',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          {isHeld ? (
            <>
              <CreditCard size={18} />
              <span>Proceed to Checkout</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Lock Seats & Continue</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
