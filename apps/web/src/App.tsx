import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Auditorium3D } from './components/Auditorium3D';
import { SeatMap2D } from './components/SeatMap2D';
import { BookingSummaryTray } from './components/BookingSummaryTray';
import { AuthModal } from './components/AuthModal';
import { OperatorPanel } from './components/OperatorPanel';
import { SeatSightlineHUD } from './components/SeatSightlineHUD';
import { fetchShowSeatMap, requestSeatLock, ShowSeatDTO } from './services/api';
import { calculateViewingMetrics } from './utils/viewSimulator';
import { Eye, Layers, Compass, Settings } from 'lucide-react';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [seats, setSeats] = useState<ShowSeatDTO[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(['C5', 'C6']);
  const [previewSeat, setPreviewSeat] = useState<ShowSeatDTO | null>(null);
  const [isHeld, setIsHeld] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isOperatorOpen, setIsOperatorOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: string;
    tenant?: string;
  } | null>(null);

  // Load live show seat inventory on mount
  useEffect(() => {
    async function loadSeats() {
      const data = await fetchShowSeatMap('show-apex-cosmic-001');
      if (data && data.seats) {
        setSeats(data.seats);
      }
    }
    loadSeats();
  }, []);

  const handleToggleSeat = (label: string) => {
    setSelectedSeats((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleHoldSeats = async () => {
    try {
      const selectedSeatIds = seats
        .filter((s) => selectedSeats.includes(s.label))
        .map((s) => s.show_seat_id);

      await requestSeatLock('show-apex-cosmic-001', selectedSeatIds, 'session-client-1');
      setIsHeld(true);
    } catch {
      // Local fallback for offline mode
      setIsHeld(true);
    }
  };

  // Resolve viewing metrics if a seat is currently being previewed
  const currentMetrics = previewSeat
    ? calculateViewingMetrics(previewSeat.eye_point)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Navigation */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Operator Console Modal */}
      <OperatorPanel
        isOpen={isOperatorOpen}
        onClose={() => setIsOperatorOpen(false)}
        tenantName={currentUser?.tenant || 'Apex Cinemas International'}
      />

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
            Cosmic Odyssey: 3D Experience (IMAX 3D Laser)
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Friday, Nov 20 • 7:30 PM • 2h 45m
          </div>
        </div>

        {/* View Switcher Controls & Operator Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser && (currentUser.role === 'OPERATOR_ADMIN' || currentUser.role === 'PLATFORM_ADMIN') && (
            <button
              onClick={() => setIsOperatorOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--accent-gold)',
                border: '1px solid var(--accent-gold)',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              <Settings size={15} />
              <span>Operator Console</span>
            </button>
          )}

          {viewMode === '3D' && selectedSeats.length > 0 && (
            <button
              onClick={() => {
                if (previewSeat) {
                  setPreviewSeat(null);
                } else {
                  const target = seats.find((s) => s.label === selectedSeats[0]);
                  if (target) setPreviewSeat(target);
                }
              }}
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
              <span>{previewSeat ? 'Auditorium Overview' : `Preview Sightline (${selectedSeats[0]})`}</span>
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
              onClick={() => {
                setViewMode('3D');
                setPreviewSeat(null);
              }}
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
              onClick={() => {
                setViewMode('2D');
                setPreviewSeat(null);
              }}
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
            seats={seats}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
            previewSeat={previewSeat}
            onSelectPreviewSeat={(seat) => setPreviewSeat(seat)}
          />
        ) : (
          <SeatMap2D
            seats={seats}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
            onPreviewSeat={(seat) => {
              setViewMode('3D');
              setPreviewSeat(seat);
            }}
          />
        )}

        {/* First-person Seat Sightline Calibrated HUD */}
        {previewSeat && currentMetrics && (
          <SeatSightlineHUD
            seatLabel={previewSeat.label}
            seatType={previewSeat.seat_type}
            priceFormatted={`$${(previewSeat.price_minor / 100).toFixed(2)}`}
            metrics={currentMetrics}
            isSelected={selectedSeats.includes(previewSeat.label)}
            onToggleSelect={() => handleToggleSeat(previewSeat.label)}
            onExitPreview={() => setPreviewSeat(null)}
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
