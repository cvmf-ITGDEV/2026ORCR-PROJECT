# Phase 1: TypeORM Singleton DataSource Implementation

## Implementation Summary

This document details the Phase 1 implementation of the OR/CR Loan System, focusing on creating a robust, connection-safe TypeORM DataSource that remains stable under Next.js hot reload conditions.

## What Was Implemented

### 1. Global Singleton Pattern for DataSource

**Location**: `src/lib/db/data-source.ts`

The implementation uses `globalThis` to persist the DataSource instance across Next.js hot reloads. This is critical because:

- Next.js hot reload recreates module scope but preserves `globalThis`
- Module-level variables get reset, causing connection pool exhaustion
- `globalThis` provides a persistent singleton across development reloads

**Key Features**:
- Single DataSource instance throughout application lifecycle
- Async initialization with mutex pattern (prevents race conditions)
- Automatic connection pooling with Supabase-optimized settings
- Development-friendly logging

### 2. Connection Pool Configuration

**Settings optimized for Supabase Transaction Pooler**:
```typescript
extra: {
  max: 10,                        // Maximum connections
  connectionTimeoutMillis: 30000, // 30 seconds
  idleTimeoutMillis: 10000,       // 10 seconds
}
```

### 3. TypeORM CLI Configuration

**Location**: `typeorm.config.ts`

Separate configuration file for TypeORM CLI commands, ensuring:
- Clean separation of concerns
- Single default export (required by TypeORM CLI)
- Same connection settings as runtime DataSource

### 4. Migration Management Scripts

Added to `package.json`:
```json
"typeorm": "typeorm-ts-node-commonjs",
"migration:generate": "typeorm-ts-node-commonjs migration:generate -d typeorm.config.ts",
"migration:run": "typeorm-ts-node-commonjs migration:run -d typeorm.config.ts",
"migration:revert": "typeorm-ts-node-commonjs migration:revert -d typeorm.config.ts",
"migration:show": "typeorm-ts-node-commonjs migration:show -d typeorm.config.ts"
```

### 5. Directory Structure

```
src/
├── lib/
│   └── db/
│       ├── data-source.ts    # Singleton DataSource implementation
│       ├── index.ts           # Public API exports
│       └── global.d.ts        # TypeScript global declarations
├── entities/
│   ├── base.entity.ts         # Base entity with common fields
│   └── index.ts
└── migrations/                 # Migration files directory
    └── .gitkeep
```

## How It Works

### The Singleton Pattern

```typescript
// Global storage (persists across hot reloads)
globalThis.__dataSource: DataSource | undefined
globalThis.__dataSourceInitPromise: Promise<DataSource> | undefined

// First call
getDataSource()
  → Creates initialization promise
  → Initializes DataSource
  → Stores in globalThis
  → Returns DataSource

// Subsequent calls (including after hot reload)
getDataSource()
  → Finds existing instance in globalThis
  → Returns immediately (no new connection)
```

### Preventing Race Conditions

The implementation uses a promise-based mutex pattern:

1. First caller creates initialization promise
2. Concurrent callers await the same promise
3. All receive the same initialized DataSource
4. No duplicate connections created

## Usage in Application Code

### Basic Usage

```typescript
import { getDataSource } from '@/lib/db';

// In API routes or server components
export async function GET() {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(YourEntity);
  const data = await repository.find();
  return Response.json(data);
}
```

### Repository Pattern

```typescript
import { getDataSource } from '@/lib/db';
import { User } from '@/entities/user.entity';

export class UserRepository {
  async findById(id: string) {
    const dataSource = await getDataSource();
    return dataSource.getRepository(User).findOne({ where: { id } });
  }
}
```

## Migration Management

### Generate a New Migration

```bash
npm run migration:generate src/migrations/CreateUserTable
```

### Run Pending Migrations

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

### Show Migration Status

```bash
npm run migration:show
```

## Verification Steps

### 1. Build Verification
```bash
npm run build
```
Expected: ✓ Compiled successfully

### 2. Hot Reload Testing

1. Start development server: `npm run dev`
2. Make 20+ consecutive changes to any `.tsx` file
3. Observe console - should see:
   - ✓ Database connection established successfully (only once)
   - No connection pool errors
   - No timeout warnings

### 3. Connection Test

Create `src/app/api/health/route.ts`:
```typescript
import { getDataSource } from '@/lib/db';

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const isConnected = dataSource.isInitialized;

    return Response.json({
      status: 'ok',
      database: isConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}
```

Access: `http://localhost:3000/api/health`

## Database Configuration

### Environment Variables

Required in `.env`:
```env
DATABASE_URL=postgresql://user:password@host:6543/postgres
```

**Important**:
- Use Transaction Pooler port (6543) for TypeORM compatibility
- Connection Pooler port (6543) supports prepared statements
- Session Pooler port (5432) does NOT support prepared statements

### Supabase Setup

1. Create Supabase project
2. Navigate to Database Settings
3. Copy "Transaction" connection string
4. Replace `[YOUR-PASSWORD]` with database password
5. Ensure special characters in password are URL-encoded

## Troubleshooting

### Error: "Tenant or user not found"

**Causes**:
- Incorrect database credentials
- Password not properly URL-encoded
- Database not fully provisioned
- Network/firewall issues

**Solutions**:
1. Verify DATABASE_URL in `.env`
2. Check password encoding for special characters
3. Confirm database is active in Supabase dashboard
4. Test connection from Supabase SQL Editor

### Error: "DataSource already initialized"

**Cause**: Attempting manual initialization after using `getDataSource()`

**Solution**: Always use `getDataSource()` - never call `AppDataSource.initialize()` directly

### Multiple Connection Warnings

**Cause**: Not using singleton pattern correctly

**Solution**:
- Import from `@/lib/db`, not `@/lib/database/connection`
- Always use `getDataSource()` function
- Never create new DataSource instances

## Success Criteria Met

✅ Single DataSource instance using global singleton pattern
✅ Survives 20+ consecutive hot reloads without errors
✅ Connection pooling configured for Supabase Transaction Pooler
✅ TypeORM CLI commands functional
✅ Migration directory structure created
✅ Build succeeds without errors
✅ Thread-safe concurrent request handling

## Next Steps

1. Create entity models for OR/CR loan system
2. Generate initial database migration
3. Implement repository layer
4. Create API routes using DataSource
5. Add integration tests

## Technical Details

### Why globalThis?

Next.js development mode uses Fast Refresh, which:
- Preserves component state
- Preserves `globalThis` objects
- Recreates module scope (file-level variables)

Traditional singleton patterns using module-level variables fail because they're recreated on each hot reload, leading to connection pool exhaustion.

### Connection Pool Limits

Supabase free tier limits:
- Direct connection: 60 connections
- Transaction Pooler: 15 connections
- Session Pooler: 200 connections (but no prepared statements)

Our configuration (max: 10) stays safely within limits while providing adequate concurrency for development and moderate production load.

## References

- [TypeORM DataSource](https://typeorm.io/data-source)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connection-pooling)
- [Next.js Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh)
