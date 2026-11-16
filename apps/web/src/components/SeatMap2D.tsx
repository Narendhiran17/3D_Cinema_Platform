import React from 'react';

interface SeatMap2DProps {
  selectedSeats: string[];
  onToggleSeat: (label: string) => void;
}

export const SeatMap2D: React.FC<SeatMap2DProps> = ({ selectedSeats, onToggleSeat }) => {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* 2D Curved Screen Graphic */}
      <div style={{
        width: '60%',
        height: '14px',
        borderTop: '5px solid #38bdf8',
        borderRadius: '50%',
        marginBottom: '12px',
        boxShadow: '0 -4px 14px rgba(56, 189, 248, 0.4)',
      }} />
      <div style={{
        fontSize: '12px',
        letterSpacing: '3px',
        color: 'var(--text-muted)',
        marginBottom: '40px',
        textTransform: 'uppercase',
      }}>
        All eyes this way • Screen
      </div>

      {/* Grid of Seats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {rows.map((row) => {
          const isPremium = row === 'D' || row === 'E';
          return (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {row}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {cols.map((num) => {
                  const label = `${row}${num}`;
                  const isSelected = selectedSeats.includes(label);

                  let bg = '#10b981';
                  if (isSelected) bg = '#3b82f6';
                  else if (isPremium) bg = '#d97706';

                  return (
                    <React.Fragment key={label}>
                      {num === 6 && <div style={{ width: '24px' }} />}
                      <button
                        onClick={() => onToggleSeat(label)}
                        aria-label={`Seat ${label}, ${isPremium ? 'Premium $25' : 'Standard $18'}, ${isSelected ? 'Selected' : 'Available'}`}
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: bg,
                          border: isSelected ? '2px solid #ffffff' : 'none',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '12px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {num}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
