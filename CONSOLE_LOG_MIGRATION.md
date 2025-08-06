# Console Log Migration Guide

## Overview

This guide helps you migrate console logs to a production-safe logging system.

## What the Logger Does

### ✅ **Development Mode**

- Shows all logs with timestamps and prefixes
- Includes detailed error information
- Shows real-time updates (if enabled)
- Shows performance metrics (if enabled)

### ✅ **Production Mode**

- **Hides all regular logs** (security + performance)
- **Keeps error logs** (for debugging issues)
- **No sensitive data** in production logs
- **Clean console** for end users

## How to Use the Logger

### 1. Import the Logger

```typescript
import { logger, boardLogger, authLogger } from "../lib/logger";
```

### 2. Replace Console Logs

**Before:**

```typescript
console.log("🔍 Fetching boards for user:", user.id);
console.error("❌ Error creating board:", error);
```

**After:**

```typescript
boardLogger.log("Fetching boards for user", { userId: user.id });
boardLogger.error("Error creating board", error);
```

### 3. Logger Methods

```typescript
// Regular logging (development only)
logger.log("User logged in", { userId: user.id });

// Warnings (development only)
logger.warn("Rate limit approaching");

// Errors (both dev and production)
logger.error("Database connection failed", error);

// Info messages (development only)
logger.info("Board created successfully");

// Real-time updates (optional, controlled by env var)
logger.realtime("Board updated", { boardId: id });

// Performance metrics (optional, controlled by env var)
logger.performance("API call completed", { duration: 150 });
```

## Environment Variables

Add these to your `.env` file for fine-grained control:

```env
# Enable real-time logging in development
VITE_DEBUG_REALTIME=true

# Enable performance logging in development
VITE_DEBUG_PERFORMANCE=true
```

## Migration Strategy

### Phase 1: Critical Logs (Do First)

- [ ] Error logs in auth store
- [ ] Error logs in boards store
- [ ] Error logs in notifications store
- [ ] Error logs in invitations store

### Phase 2: Info Logs (Do Second)

- [ ] Board creation/update logs
- [ ] User action logs
- [ ] Real-time update logs

### Phase 3: Debug Logs (Do Last)

- [ ] Performance metrics
- [ ] Detailed state changes
- [ ] Verbose real-time logs

## Benefits

### ✅ **Security**

- No sensitive data in production logs
- No user information exposed
- Clean error messages

### ✅ **Performance**

- No console spam in production
- Faster page loads
- Better user experience

### ✅ **Debugging**

- Structured logs with timestamps
- Categorized by feature area
- Easy to filter and search

### ✅ **Maintenance**

- Centralized logging control
- Easy to add log aggregation
- Consistent log format

## Quick Migration Commands

Replace common patterns:

```bash
# Replace console.log with logger.log
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/console\.log(/logger.log(/g'

# Replace console.error with logger.error
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/console\.error(/logger.error(/g'

# Replace console.warn with logger.warn
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/console\.warn(/logger.warn(/g'
```

## Testing

1. **Development**: All logs should appear normally
2. **Production**: Only errors should appear
3. **Build**: No console warnings about unused variables

## Next Steps

1. Start with error logs (most important)
2. Move to info logs (medium priority)
3. Finish with debug logs (low priority)
4. Test in both development and production
5. Monitor for any missing error information
