import React, { useState } from 'react';
import { Header } from './components/Header';
import { Auditorium3D } from './components/Auditorium3D';
import { SeatMap2D } from './components/SeatMap2D';
import { BookingSummaryTray } from './components/BookingSummaryTray';
import { Eye, Layers, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [selectedSeats, setSelectedSeats] = useState<string[]>(['C5', 'C6']);
  const [previewSeat, setPreviewSeat] = useState<string | null>(null);
  const [isHeld, setIsHeld] = useState<boolean>(false);

  const handleToggleSeat = (label: string) => {
    setSelectedSeats((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleHoldSeats = () => {
    setIsHeld(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Navigation */}
      <Header />

      {/* Show Information & View Mode Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 32px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '4px',
            letterSpacing: '1px',
          }}>
            NOW SHOWING
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>
            Cosmic Odyssey: 3D Experience (IMAX 3D)
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Friday, Nov 20 • 7:30 PM • 2h 45m
          </div>
        </div>

        {/* View Switcher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {viewMode === '3D' && selectedSeats.length > 0 && (
            <button
              onClick={() => setPreviewSeat((prev) => (prev ? null : selectedSeats[0]))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: previewSeat ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                color: previewSeat ? '#000' : 'var(--text-main)',
                border: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <Eye size={16} />
              <span>{previewSeat ? 'Auditorium Overview' : `Preview Seat (${selectedSeats[0]})`}</span>
            </button>
          )}

          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            padding: '3px',
          }}>
            <button
              onClick={() => setViewMode('3D')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: viewMode === '3D' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === '3D' ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <Compass size={15} />
              <span>3D View</span>
            </button>
            <button
              onClick={() => setViewMode('2D')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: viewMode === '2D' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === '2D' ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <Layers size={15} />
              <span>2D Seat Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {viewMode === '3D' ? (
          <Auditorium3D
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
            previewSeat={previewSeat}
            onClearPreview={() => setPreviewSeat(null)}
          />
        ) : (
          <SeatMap2D
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
          />
        )}
      </div>

      {/* Persistent Bottom Booking Summary Tray */}
      <BookingSummaryTray
        selectedSeats={selectedSeats}
        onProceedToHold={handleHoldSeats}
        isHeld={isHeld}
        holdExpiresInSeconds={600}
      />
    </div>
  );
};
