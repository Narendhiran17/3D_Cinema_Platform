import React from 'react';
import { ShowSeatDTO } from '../services/api';

interface SeatMap2DProps {
  seats: ShowSeatDTO[];
  selectedSeats: string[];
  onToggleSeat: (label: string) => void;
  onPreviewSeat: (seat: ShowSeatDTO) => void;
}

export const SeatMap2D: React.FC<SeatMap2DProps> = ({
  seats,
  selectedSeats,
  onToggleSeat,
  onPreviewSeat,
}) => {
  // Group seats by row
  const rowsMap: { [row: string]: ShowSeatDTO[] } = {};
  seats.forEach((s) => {
    if (!rowsMap[s.row]) rowsMap[s.row] = [];
    rowsMap[s.row].push(s);
  });

  const sortedRows = Object.keys(rowsMap).sort();

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
        {sortedRows.map((row) => {
          const rowSeats = rowsMap[row].sort((a, b) => parseInt(a.number) - parseInt(b.number));
          return (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {row}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {rowSeats.map((seat, idx) => {
                  const isSelected = selectedSeats.includes(seat.label);
                  const isVIP = seat.seat_type === 'VIP_RECLINER' || seat.seat_type === 'PREMIUM';
                  const isAccessible = seat.seat_type === 'ACCESSIBLE';
                  const isHeld = seat.status === 'HELD';

                  let bg = isVIP ? '#d97706' : isAccessible ? '#06b6d4' : '#10b981';
                  if (isSelected) bg = '#3b82f6';
                  else if (isHeld) bg = '#f59e0b';

                  return (
                    <React.Fragment key={seat.show_seat_id}>
                      {(idx === 3 || idx === 12) && <div style={{ width: '20px' }} />}
                      <button
                        onClick={() => onToggleSeat(seat.label)}
                        onDoubleClick={() => onPreviewSeat(seat)}
                        title={`Seat ${seat.label} (${seat.seat_type} - $${(seat.price_minor / 100).toFixed(2)}) - Double click to preview 3D sightline`}
                        aria-label={`Seat ${seat.label}, ${seat.seat_type} $${(seat.price_minor / 100).toFixed(2)}, ${isSelected ? 'Selected' : 'Available'}`}
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
                        {seat.number}
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
