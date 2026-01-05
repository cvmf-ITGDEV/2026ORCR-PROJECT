# ADR-001: Technology Stack and Architectural Governance

**Status:** Accepted
**Date:** 2026-01-05
**Decision Authority:** Architecture Team

## Executive Summary

This Architecture Decision Record establishes the mandatory technology stack and architectural patterns for the 2026ORCR-PROJECT. All decisions documented here are **binding** and require formal architecture review before modification.

## Mandatory Technology Stack

### Frontend: Next.js 14 + React 18 + TypeScript (Strict Mode)

**Decision:** Next.js 14 App Router with React 18, TypeScript strict mode enabled

**Rationale:**
- Server Components reduce client bundle size by 40-60%
- Streaming SSR improves Time to First Byte (TTFB)
- App Router provides superior data fetching patterns
- Built-in image and font optimization
- TypeScript strict mode eliminates entire classes of runtime errors

**Requirements:**
- App Router ONLY (Pages Router prohibited)
- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitReturns: true` in tsconfig
- Server Components as default, Client Components only when necessary

### Database Access: TypeORM (Exclusive)

**Decision:** TypeORM 0.3+ as the ONLY database access layer

**Rationale:**
- Explicit SQL control when needed (no ORM abstraction limitations)
- Migration files are readable SQL (not opaque auto-generated code)
- Decorator-based entities provide clear schema definitions
- Full transaction support with explicit control
- Repository pattern enforces clean architecture

**Explicit Prohibition:** No other ORM or database client allowed

### Infrastructure: Supabase (Limited Scope)

**Decision:** Supabase for PostgreSQL hosting and Authentication services ONLY

**Scope Limitations:**
- ✅ PostgreSQL database hosting (accessed via TypeORM)
- ✅ Authentication services (sign up, sign in, OAuth)
- ✅ Row Level Security policy management
- ❌ Database queries (must use TypeORM)
- ❌ Direct table access via Supabase client

**Rationale:** Separation of concerns - Supabase provides infrastructure, TypeORM handles data access

### UI Framework: Tailwind CSS + shadcn/ui

**Decision:** Tailwind CSS 3+ with shadcn/ui component library

**Rationale:**
- Zero runtime CSS cost (all generated at build time)
- Components live in your codebase (no node_modules dependency)
- Built on Radix UI primitives (accessibility built-in)
- Full customization without fighting framework defaults
- Lucide icons provide consistent, tree-shakeable icon system

**Design Requirements:**
- Mobile-first responsive design
- NO purple/indigo/violet hues in default theme
- 8px spacing scale
- Semantic color tokens

### Validation: Zod

**Decision:** Zod 3+ for all runtime validation

**Rationale:**
- Runtime type safety at application boundaries
- Automatic TypeScript type inference (no duplication)
- Composable schemas
- Excellent error messages
- Zero dependencies

**Validation Boundaries:**
1. User input (forms, URL params)
2. API request/response payloads
3. External service responses
4. Environment variables

## Explicitly Prohibited Technologies

### ❌ Prisma ORM - REJECTED

**Reasons:**
- Declarative migrations create complexity for schema changes
- Generated client increases bundle size
- Limited raw SQL support restricts optimization
- Schema-first approach duplicates type definitions
- Migration files difficult to review

**ESLint Rule:** `no-restricted-imports` blocks `@prisma/*` imports

### ❌ Supabase JS Client (for database) - REJECTED

**Reasons:**
- Creates multiple data access patterns
- Violates single responsibility (TypeORM is data layer)
- Encourages mixing data access with presentation logic
- Makes future migrations difficult

**Allowed Usage:** Authentication only

### ❌ Material-UI (MUI) - REJECTED

**Reasons:**
- Large bundle size (300KB+)
- CSS-in-JS runtime overhead
- Opinionated Material Design conflicts with custom requirements
- Complex theme customization

**Alternative:** shadcn/ui

### ❌ TanStack Libraries - REJECTED

**Reasons:**
- TanStack Query conflicts with Server Components
- Next.js provides built-in data fetching
- Server Components reduce need for client state management
- Adds unnecessary complexity

**Alternative:** Server Components + native fetch

## Layered Architecture

```
┌─────────────────────────────────┐
│   Presentation Layer            │  Next.js App Router + React
│   (UI Components, Pages)        │  shadcn/ui + Tailwind CSS
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│   Validation Layer              │  Zod Schemas
│   (Input/Output Validation)     │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│   Business Logic Layer          │  TypeScript Services
│   (Workflows, Rules)            │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│   Data Access Layer             │  TypeORM Repositories
│   (Database Operations)         │  (EXCLUSIVE access)
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│   Infrastructure Layer          │  Supabase PostgreSQL
│   (Database + Auth)             │  + Authentication
└─────────────────────────────────┘
```

## Layer Responsibilities

**Presentation Layer:**
- Render UI
- Handle user interactions
- Display data from services
- Client-side validation feedback

**Validation Layer:**
- Define schemas for all inputs
- Runtime type checking
- Data transformation
- Generate TypeScript types

**Business Logic Layer:**
- Implement business rules
- Coordinate repository operations
- Manage transactions
- Authorization logic

**Data Access Layer:**
- Define entities
- Execute queries
- Manage relationships
- Handle database transactions

**Infrastructure Layer:**
- Host database
- Manage auth sessions
- Enforce RLS policies

## Integration Patterns

### Pattern: Server Component Data Fetching

```typescript
// app/users/page.tsx
import { userService } from '@/services/user-service';

export default async function UsersPage() {
  const users = await userService.getAllUsers();
  return <UserList users={users} />;
}
```

### Pattern: Server Action with Validation

```typescript
'use server';
import { createUserSchema } from '@/schemas/user';
import { userService } from '@/services/user-service';

export async function createUserAction(formData: FormData) {
  const result = createUserSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  });

  if (!result.success) {
    return { error: result.error.format() };
  }

  const user = await userService.createUser(result.data);
  return { success: true, user };
}
```

### Pattern: Authentication Flow

```typescript
// Client-side
import { createClientSupabase } from '@/lib/supabase';

const supabase = createClientSupabase();
await supabase.auth.signInWithPassword({ email, password });

// Server-side
import { createServerSupabase } from '@/lib/supabase';

const supabase = await createServerSupabase();
const { data: { session } } = await supabase.auth.getSession();
```

## Development Workflow

### Adding a Feature

1. Define Zod schema in `/src/schemas/`
2. Create TypeORM entity in `/src/entities/`
3. Generate migration: `npm run db:migrate:create`
4. Create repository in `/src/repositories/`
5. Implement service in `/src/services/`
6. Build UI with shadcn/ui
7. Create Next.js route

### Code Quality Gates

**Pre-commit (Automated):**
- ESLint with auto-fix
- Prettier formatting
- TypeScript type checking

**Pre-merge (Required):**
- All tests pass
- Build succeeds
- No prohibited imports
- Documentation updated

## Security Requirements

### Database Security
- Row Level Security MANDATORY on all tables
- No service role keys in client code
- All queries parameterized via TypeORM

### Authentication Security
- JWT tokens in HTTP-only cookies
- Server-side session validation
- No sensitive data in client state

### Type Safety
- TypeScript strict mode eliminates null/undefined errors
- Zod validation at all external boundaries
- No `any` types without justification

## Exception Process

### Requesting Technology Deviation

1. **Document Justification**
   - Explain why current stack is insufficient
   - Identify specific limitation
   - Show attempts with approved technologies

2. **Submit ADR Proposal**
   - Write detailed analysis
   - Include trade-offs
   - Document migration path

3. **Architecture Review**
   - Present to team
   - Defend with data
   - Address concerns

4. **Approval Criteria**
   - Unanimous team agreement
   - Fundamental limitation exists
   - Solves critical requirement
   - Acceptable long-term impact

### Emergency Exceptions

Production incidents may require temporary deviations:
- CTO/Technical Lead approval required
- Incident must be documented
- Permanent solution planned within 2 weeks
- Technical debt ticket created

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Largest Contentful Paint: < 2.5s
- Bundle size: < 200KB (gzipped)

## Monitoring

**Required Logging:**
- All service operations
- Authentication events
- Database query performance
- Error stack traces

**Metrics:**
- Core Web Vitals
- Query performance
- Auth success rates
- Error rates by route

## Conclusion

This ADR establishes an unambiguous technical foundation that maximizes:

- **Type Safety:** TypeScript + Zod eliminate runtime errors
- **Performance:** Server Components + Tailwind minimize bundles
- **Maintainability:** Clear boundaries + repository pattern
- **Security:** RLS + validation + JWT authentication
- **Developer Experience:** Modern tooling + IDE support

All team members must adhere to these decisions. Deviations require formal review.

**Revision History:**
- 2026-01-05: Initial version established
