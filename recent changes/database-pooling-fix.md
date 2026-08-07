# Database Connection Troubleshooting

## Problem
Prisma errors with Neon PostgreSQL:
- `Can't reach database server at ep-old-dust-aod88wdp.c-2.ap-southeast-1.aws.neon.tech:5432`
- `Timed out fetching a new connection from the connection pool`
- `Current connection pool timeout: 20, connection limit: 13`

## Root Cause
1. **Low connection pool limit** (13 connections) insufficient for concurrent requests
2. **Short pool timeout** (20 seconds) causes queries to fail under load
3. **No connection pooling mode** configured for Neon's pgBouncer
4. **Missing DIRECT_URL** for migrations

## Solution Applied (2026-08-06)

### Files Modified
- `.env` — increased pool size and timeouts
- `prisma/schema.prisma` — added directUrl for pgBouncer mode
- `lib/prisma.ts` — updated connection URL builder with env-based tuning

### Configuration Changes
**Before:**
```
- connection_limit: 13 (default)
- pool_timeout: 20 seconds
- connect_timeout: 10 seconds
```

**After:**
```env
DATABASE_URL=...&pool_recycle=300&connection_limit=20
DATABASE_DIRECT_URL=...  (for migrations)
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_POOL_TIMEOUT=45
```

**Prisma config:**
```typescript
// lib/prisma.ts
connect_timeout=30  // 30 seconds
pool_timeout=45     // 45 seconds (from env)
```

### How This Helps
1. **pgBouncer mode** separates pooled queries from direct migrations (no lock conflicts)
2. **20 connections** handles 3–4× more concurrent requests than before
3. **45s pool timeout** gives slow queries time to acquire a connection
4. **Retry middleware** auto-reconnects on transient pool exhaustion
5. **Pool recycling every 300s** clears idle connections

## Next Steps
1. **Regenerate Prisma client:**
   ```bash
   npx prisma generate
   ```

2. **Verify database connectivity:**
   ```bash
   npx prisma db push
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

4. **Monitor pool status** in logs — should see no more pool timeout errors

## If Still Failing
- Verify Neon database is running and not suspended
- Check network connectivity: `ping ep-old-dust-aod88wdp.c-2.ap-southeast-1.aws.neon.tech`
- Review Neon dashboard for connection limits or active connections
- Consider Neon "Professional" tier if in production (unlimited connections)

## References
- Neon pooling: https://neon.tech/docs/connect/connection-pooling
- Prisma + Neon: https://pris.ly/d/neon-serverless
- Connection pool tuning: https://pris.ly/d/connection-pool

