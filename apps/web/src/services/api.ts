const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
  // 1. First attempt to load real 105-seat layout from cinema_layout_metadata.json (Blender auditorium model)
  try {
    const metaRes = await fetch('/models/cinema_layout_metadata.json');
    if (metaRes.ok) {
      const meta = await metaRes.json();
      if (meta && Array.isArray(meta.seats) && meta.seats.length > 0) {
        const seats: ShowSeatDTO[] = meta.seats.map((s: any) => {
          const p = s.position; // Blender [x, y, z] -> Three.js [p[0], p[2], -p[1]]
          const e = s.eye_point; // Blender [x, y, z] -> Three.js [e[0], e[2], -e[1]]
          const isVIP = s.seat_type === 'VIP_RECLINER';
          const isAcc = s.seat_type === 'ACCESSIBLE';
          const priceMinor = isVIP ? 2800 : isAcc ? 1800 : 2000;

          return {
            show_seat_id: `ss-${showId}-${s.label.toLowerCase()}`,
            seat_id: s.seat_id,
            label: s.label,
            row: s.row_label,
            number: s.seat_number.toString(),
            seat_type: s.seat_type,
            price_minor: priceMinor,
            currency: 'USD',
            status: 'AVAILABLE',
            version: 1,
            position: [Number(p[0].toFixed(3)), Number(p[2].toFixed(3)), Number((-p[1]).toFixed(3))],
            eye_point: [Number(e[0].toFixed(3)), Number(e[2].toFixed(3)), Number((-e[1]).toFixed(3))],
            object_identifier: s.mesh_reference,
          };
        });

        return {
          show_id: showId,
          auditorium_id: meta.auditorium_id || 'AUD_HORIZON_SCREEN_01',
          layout_version: meta.layout_version || 1,
          currency: 'USD',
          seats,
        };
      }
    }
  } catch (err) {
    console.info('Could not load local cinema_layout_metadata.json, trying backend', err);
  }

  // 2. Fetch from backend API
  try {
    const res = await fetch(`${API_BASE_URL}/shows/${showId}/seat-map`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API server unreachable, using local fallback seed data', err);
    // Return standard fallback
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

export interface BookingDTO {
  id: string;
  booking_reference: string;
  movie_title: string;
  cinema_name: string;
  auditorium_name: string;
  starts_at: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  total_minor: number;
  currency: string;
  items: Array<{
    seat_label: string;
    seat_type: string;
    unit_price_minor: number;
  }>;
  created_at: string;
  confirmed_at?: string;
}

export async function fetchMyBookings(token?: string): Promise<BookingDTO[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/bookings/me`, { headers });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Using local booking fallback', err);
    return [
      {
        id: 'bk-demo-001',
        booking_reference: 'CIN-2026-X99Q',
        movie_title: 'Cosmic Odyssey: 3D Experience',
        cinema_name: 'Apex Grand Cinema',
        auditorium_name: 'Auditorium 1 (IMAX 3D Laser)',
        starts_at: '2026-11-20T19:30:00Z',
        status: 'CONFIRMED',
        total_minor: 3600,
        currency: 'USD',
        items: [
          { seat_label: 'C5', seat_type: 'STANDARD', unit_price_minor: 1800 },
          { seat_label: 'C6', seat_type: 'STANDARD', unit_price_minor: 1800 },
        ],
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
      },
    ];
  }
}

export async function cancelBookingApi(bookingId: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to cancel booking');
  return (await res.json()).data;
}

export interface PlatformTenantDTO {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscription_plan: string;
  cinema_count: number;
  created_at: string;
}

export interface PlatformAnalyticsDTO {
  total_tenants: number;
  active_cinemas: number;
  total_bookings: number;
  gross_volume_minor: number;
  currency: string;
  average_occupancy_percentage: number;
  system_health: string;
}

export interface AuditLogDTO {
  id: string;
  action: string;
  performed_by: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  timestamp: string;
}

export async function fetchPlatformTenants(token: string): Promise<PlatformTenantDTO[]> {
  const res = await fetch(`${API_BASE_URL}/platform/tenants`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch platform tenants');
  return (await res.json()).data;
}

export async function onboardPlatformTenant(
  token: string,
  payload: { name: string; slug: string; subscription_plan: string }
): Promise<PlatformTenantDTO> {
  const res = await fetch(`${API_BASE_URL}/platform/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to onboard tenant');
  return (await res.json()).data;
}

export async function updatePlatformTenantStatus(
  token: string,
  tenantId: string,
  status: string,
  reason?: string
) {
  const res = await fetch(`${API_BASE_URL}/platform/tenants/${tenantId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, reason }),
  });
  if (!res.ok) throw new Error('Failed to update tenant status');
  return (await res.json()).data;
}

export async function fetchPlatformAnalytics(token: string): Promise<PlatformAnalyticsDTO> {
  const res = await fetch(`${API_BASE_URL}/platform/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch platform analytics');
  return (await res.json()).data;
}

export async function fetchPlatformAuditLogs(token: string): Promise<AuditLogDTO[]> {
  const res = await fetch(`${API_BASE_URL}/platform/audit-logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch platform audit logs');
  return (await res.json()).data;
}

