# Troubleshooting Guide

## Common Issues

### 1. API Returns 500 Error
**Symptoms**: `/api/stats` or other endpoints return 500.
**Cause**: Often due to Prisma BigInt serialization or database locking.
**Fix**: 
- Restart the server: `npm run dev`.
- Ensure no other `prisma studio` instances are running.
- **Note**: The Home Page has a fallback mode that works even if the API is down.

### 2. Database Locked
**Symptoms**: `Error: SQLITE_BUSY: database is locked`.
**Fix**: 
- Stop all node processes.
- Ensure `prisma studio` is closed.
- Retry.

### 3. Demo Controller Not Visible
**Fix**: Press `Ctrl + .` (Period) to toggle the overlay.

### 4. AI Summary "Loading..." forever
**Cause**: OpenAI API key missing or timeout.
**Fix**: The UI will timeout after 30s and show a manual "Retry" button. Check `.env` variables.

## Logs
Server logs are visible in the terminal running `npm run dev`. Look for `[API]` prefixed messages.
