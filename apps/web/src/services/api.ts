const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface ShowSeatDTO {
  show_seat_id: string;
  seat_id: string;
  label: string;
  row: string;
  number: string;
  seat_type: string;
  price_minor: number;
  currency: string;
  status: string;
  version: number;
  position: [number, number, number];
  eye_point: [number, number, number];
  object_identifier: string;
}

export interface ShowSeatMapResponse {
  show_id: string;
  auditorium_id: string;
  layout_version: number;
  currency: string;
  seats: ShowSeatDTO[];
}

export async function fetchShowSeatMap(showId: string): Promise<ShowSeatMapResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/shows/${showId}/seat-map`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API server unreachable, using local fallback seed data', err);
    // Return standard 50-seat fallback
    const seats: ShowSeatDTO[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      const z = -4.0 + rIdx * 2.2;
      const y = 0.8 + rIdx * 0.45;
      const isPremium = row === 'D' || row === 'E';

      for (let num = 1; num <= 10; num++) {
        const aisleOffset = num > 5 ? 0.6 : -0.6;
        const x = (num - 5.5) * 1.05 + aisleOffset;
        const label = `${row}${num}`;
        seats.push({
          show_seat_id: `ss-${showId}-${label.toLowerCase()}`,
          seat_id: `seat-${label.toLowerCase()}`,
          label,
          row,
          number: num.toString(),
          seat_type: isPremium ? 'PREMIUM' : 'STANDARD',
          price_minor: isPremium ? 2500 : 1800,
          currency: 'USD',
          status: 'AVAILABLE',
          version: 1,
          position: [Number(x.toFixed(3)), Number(y.toFixed(3)), Number(z.toFixed(3))],
          eye_point: [Number(x.toFixed(3)), Number((y + 1.1).toFixed(3)), Number(z.toFixed(3))],
          object_identifier: `SEAT_${row}_${num.toString().padStart(2, '0')}`,
        });
      }
    }

    return {
      show_id: showId,
      auditorium_id: 'aud-apex-imax-01',
      layout_version: 1,
      currency: 'USD',
      seats,
    };
  }
}

export async function requestSeatLock(
  showId: string,
  showSeatIds: string[],
  sessionId: string
) {
  const idempotencyKey = `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const res = await fetch(`${API_BASE_URL}/seat-locks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      show_id: showId,
      show_seat_ids: showSeatIds,
      booking_session_id: sessionId,
    }),
  });
  if (!res.ok) throw new Error('Failed to create seat lock');
  return (await res.json()).data;
}
