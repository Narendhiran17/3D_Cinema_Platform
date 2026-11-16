export type SeatStatus =
  | 'AVAILABLE'
  | 'SELECTED_LOCAL'
  | 'HELD_BY_CURRENT_SESSION'
  | 'HELD_BY_OTHER'
  | 'CONFIRMED'
  | 'BLOCKED'
  | 'ACCESSIBLE_AVAILABLE';

export type SeatCategory = 'STANDARD' | 'PREMIUM' | 'RECLINER' | 'WHEELCHAIR';

export interface SeatCoordinates {
  position: [number, number, number];
  rotation?: [number, number, number];
  eyePoint?: [number, number, number];
}

export interface SeatItem {
  showSeatId: string;
  seatId: string;
  label: string;
  seatType: SeatCategory;
  priceMinor: number;
  currency: string;
  status: SeatStatus;
  version: number;
  transform?: SeatCoordinates;
}

export interface ScreenMetadata {
  center: [number, number, number];
  width: number;
  height: number;
  normal: [number, number, number];
}

export interface AuditoriumLayout {
  layoutId: string;
  auditoriumId: string;
  version: number;
  screen: ScreenMetadata;
  seats: SeatItem[];
}

export interface ShowSummary {
  id: string;
  tenantId: string;
  cinemaId: string;
  auditoriumId: string;
  movieTitle: string;
  startsAt: string;
  endsAt: string;
  format: string;
  status: string;
}

export interface BookingHold {
  holdId: string;
  status: 'HELD';
  expiresAt: string;
  showSeatIds: string[];
}
