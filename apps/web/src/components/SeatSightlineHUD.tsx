import React from 'react';
import { ArrowLeft, Check, Sparkles, Compass } from 'lucide-react';
import { ViewingMetrics } from '../utils/viewSimulator';

interface SeatSightlineHUDProps {
  seatLabel: string;
  seatType: string;
  priceFormatted: string;
  metrics: ViewingMetrics;
  isSelected: boolean;
  onToggleSelect: () => void;
  onExitPreview: () => void;
}

export const SeatSightlineHUD: React.FC<SeatSightlineHUDProps> = ({
  seatLabel,
  seatType,
  priceFormatted,
  metrics,
  isSelected,
  onToggleSelect,
  onExitPreview,
}) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(10, 13, 20, 0.88)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '28px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
      zIndex: 50,
      color: '#fff',
    }}>
      {/* Return to overview */}
      <button
        onClick={onExitPreview}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-main)',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} />
        <span>Auditorium Overview</span>
      </button>

      {/* Seat Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
        <div style={{
          backgroundColor: 'var(--accent-gold)',
          color: '#000',
          fontWeight: 800,
          fontSize: '16px',
          padding: '6px 12px',
          borderRadius: '6px',
        }}>
          {seatLabel}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>
            {seatType} • {priceFormatted}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: metrics.qualityColor }}>
            <Sparkles size={13} />
            <span>{metrics.qualityRating}</span>
          </div>
        </div>
      </div>

      {/* Sightline Calibrated Metrics */}
      <div style={{ display: 'flex', gap: '20px', borderLeft: '1px solid var(--border)', paddingLeft: '20px', fontSize: '12px' }}>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Distance to Screen</div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>{metrics.distanceMeters} m</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Viewing Angle</div>
          <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={13} color="var(--accent-gold)" />
            <span>{metrics.horizontalAngleDegrees}°</span>
          </div>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={onToggleSelect}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: isSelected ? '#ef4444' : 'var(--accent-gold)',
          color: isSelected ? '#fff' : '#000',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        {isSelected ? (
          <span>Deselect Seat</span>
        ) : (
          <>
            <Check size={16} />
            <span>Select Seat</span>
          </>
        )}
      </button>
    </div>
  );
};
