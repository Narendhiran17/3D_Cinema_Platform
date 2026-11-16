# Production Deployment and Operations Runbook

## 1. System Architecture & Service Topology

The **3D Cinema Platform** is an enterprise-grade, multi-tenant cinema management and ticket-booking platform featuring calibrated 3D sightline simulation, sub-millisecond inventory coordination, and resilient payment reconciliation.

```
                  +-----------------------------------+
                  |   Internet / Public Traffic       |
                  +-----------------+-----------------+
                                    |
                         HTTPS (Port 443 / 80)
                                    |
                    +---------------+---------------+
                    |   Nginx Reverse Proxy & CDN   |
                    |   (SPA Fallback & Caching)    |
                    +---------------+---------------+
                                    |
                 +------------------+------------------+
                 |                                     |
        / (Static Assets)                       /api/v1 (REST & WebSockets)
                 |                                     |
    +------------v-------------+          +------------v-------------+
    |   Web Client (React 18)   |          |  Backend (FastAPI Engine) |
    |   - Three.js 3D Engine   |          |  - OWASP Security Headers |
    |   - First-Person HUD     |          |  - Rate Limiter Sliding   |
    |   - 2D Canvas Fallback   |          |  - Real-Time WS Fanout   |
    +--------------------------+          +------------+-------------+
                                                       |
                                  +--------------------+--------------------+
                                  |                                         |
                     +------------v------------+               +------------v------------+
                     |  PostgreSQL 18 DB       |               |  Redis 7 In-Memory Cache|
                     |  - Authoritative Ledger |               |  - Ephemeral Seat Locks |
                     |  - Versioned Layouts    |               |  - WebSocket Pub/Sub    |
                     |  - Financial Snapshots  |               |  - Sliding Rate Limits  |
                     +-------------------------+               +-------------------------+
```

---

## 2. Environment Configuration & Secret Management

All secrets must be injected as environment variables from secure secret stores (e.g. AWS Secrets Manager, HashiCorp Vault, GitHub Secrets). Never commit `.env` or plaintext credentials to source control.

| Variable Name | Environment | Description | Example / Recommended Value |
|---|---|---|---|
| `APP_ENV` | All | Application lifecycle mode | `production` |
| `DEBUG` | Production | Disables detailed stack traces | `false` |
| `SECRET_KEY` | Production | 256-bit cryptographic key for JWT signing | `openssl rand -hex 32` |
| `DATABASE_URL` | Production | AsyncPG connection string for PostgreSQL | `postgresql+asyncpg://user:pass@host:5432/db` |
| `REDIS_URL` | Production | Protected Redis connection URI | `redis://:pass@host:6379/0` |
| `CORS_ORIGINS` | Production | Allowed origin whitelist | `https://cinema.example.com` |
| `SEAT_LOCK_EXPIRATION_SECONDS` | All | Provisional seat hold time-to-live | `600` (10 minutes) |

---

## 3. Database Initialization & Schema Provisioning

For initial production provisioning and schema migration verification:
```powershell
# Set active backend virtual environment
Set-Location backend

# Execute database schema provisioning script
& ".\.venv\Scripts\python.exe" scripts/init_db.py
```
This runs `Base.metadata.create_all` against the configured PostgreSQL instance to provision tables, foreign key constraints, composite tenant indexes, and unique hold constraints.

---

## 4. Production Container Deployment

### Starting the Production Cluster
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Validating Service Health
```bash
# 1. Liveness Probe
curl -i http://localhost:8000/health/live

# 2. Readiness Probe (validates Postgres & Redis connectivity)
curl -i http://localhost:8000/health/ready

# 3. Web Client Delivery
curl -i http://localhost/
```

---

## 5. Zero-Downtime Rolling Update Strategy

1. **Database Backward Compatibility:**
   - Database migrations must strictly follow additive changes (add columns, create new tables, add indexes concurrently). Never drop columns in the active migration step.
2. **Stateless Backend Scaling:**
   - The FastAPI backend application instances are completely stateless.
   - Deploy backend instances behind an upstream load balancer (e.g., Nginx, ALB, Traefik).
   - Perform a rolling replacement: bring up `vN+1` instances, wait for `/health/ready` to return HTTP 200, then terminate `vN` instances.
3. **Asset Immutability:**
   - Web application bundle assets are fingerprinted (`index-[hash].js`, `index-[hash].css`) and cached with `Cache-Control: public, max-age=15552000, immutable`.
   - `index.html` is served with `Cache-Control: no-cache` to ensure instant client adoption of new releases.

---

## 6. Backup & Disaster Recovery (RPO/RTO)

- **Recovery Point Objective (RPO):** $\le 1$ hour.
- **Recovery Time Objective (RTO):** $\le 4$ hours.

### Automated PostgreSQL Backup Procedure
```bash
# Run hourly incremental or daily full logical dump
pg_dump -U cinema_user -Fc -d cinema_platform > /backups/cinema_platform_$(date +%Y%m%d_%H%M%S).dump

# Encrypt and ship to cold off-site storage (S3 / GCS with Object Lock)
aws s3 cp /backups/*.dump s3://cinema-production-backups/database/ --sse aws:kms
```

### Database Restoration Runbook
```bash
# In event of severe data corruption or failover:
createdb -U postgres cinema_platform_recovery
pg_restore -U cinema_user -d cinema_platform_recovery /backups/latest.dump
```

---

## 7. Incident Response & Troubleshooting Playbook

| Symptom | Root Cause Investigation | Remediation Step |
|---|---|---|
| **`429 RATE_LIMIT_EXCEEDED`** | Client sending excessive burst requests to sensitive routes | Inspect client IP in access logs; adjust rate limiter threshold if legitimate partner |
| **`409 SEAT_UNAVAILABLE`** | Legitimate concurrent booking conflict or stale client state | Normal high-concurrency behavior; client UI updates automatically via WebSocket |
| **`401 INVALID_SIGNATURE` on Webhooks** | Payment gateway secret mismatch or tampering | Verify webhook secret matches provider dashboard configuration |
| **WebSocket Connection Drops** | Reverse proxy idle timeout elapsed | Ensure Nginx `proxy_read_timeout` is configured to `3600s` and WebSocket ping/pong is enabled |
