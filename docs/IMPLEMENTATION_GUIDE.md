# Technical Governance Framework - Implementation Guide

## Overview

This document provides the complete implementation roadmap for establishing the technical governance framework for 2026ORCR-PROJECT.

## Architecture Decision Record

The definitive technology stack and architectural patterns are documented in:
- **Location:** `/docs/architecture/ADR-001-technology-stack.md`
- **Status:** Accepted and Binding
- **Scope:** All development activities

## Implementation Checklist

### Phase 1: Project Initialization

#### 1.1 Next.js 14 Setup
```bash
npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*" --eslint
```

**Configuration:**
- Enable TypeScript strict mode in `tsconfig.json`
- Add: `noUncheckedIndexedAccess: true`
- Add: `noImplicitReturns: true`
- Add: `forceConsistentCasingInFileNames: true`

#### 1.2 Environment Variables
Update `.env` with:
```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
DATABASE_POOL_SIZE=10
```

Create `.env.example` with placeholder values (no secrets).

### Phase 2: TypeORM Integration

#### 2.1 Install Dependencies
```bash
npm install typeorm@^0.3.20 pg reflect-metadata dotenv
npm install --save-dev @types/pg ts-node
```

#### 2.2 Create TypeORM Configuration

**File:** `typeorm.config.ts`
```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
```

**File:** `src/lib/database/data-source.ts`
- Implement AppDataSource with connection pooling
- Create getDataSource() singleton function
- Export closeDataSource() for cleanup

**File:** `src/lib/database/base-repository.ts`
- Create abstract BaseRepository class
- Implement findAll(), findById(), create(), update(), delete()
- Use DeepPartial<Entity> for type safety

#### 2.3 Directory Structure
```
src/
├── entities/          # TypeORM entity definitions
├── repositories/      # Repository classes
├── migrations/        # Database migrations
└── lib/
    └── database/      # TypeORM configuration
```

### Phase 3: Supabase Auth Integration

#### 3.1 Install Supabase Packages
```bash
npm install @supabase/ssr @supabase/supabase-js
```

#### 3.2 Create Auth Clients

**File:** `src/lib/supabase/auth-client.ts`
- Browser client for client-side auth operations
- Uses createBrowserClient from @supabase/ssr

**File:** `src/lib/supabase/auth-server.ts`
- Server client for server-side auth operations
- Uses createServerClient with cookie handling

**File:** `src/middleware.ts`
- Implement session refresh middleware
- Handle auth state across requests

**CRITICAL:** Add comments in auth files stating Supabase is for AUTH ONLY, not database queries.

### Phase 4: UI Framework Setup

#### 4.1 Initialize shadcn/ui
```bash
npx shadcn@latest init -d --yes
```

#### 4.2 Install Icons
```bash
npm install lucide-react
```

#### 4.3 Component Structure
```
src/components/
├── ui/           # shadcn/ui components (via CLI)
├── common/       # Shared reusable components
└── features/     # Feature-specific components
```

### Phase 5: Validation Layer

#### 5.1 Install Zod
```bash
npm install zod
```

#### 5.2 Create Schema Structure
```
src/schemas/
├── common.ts     # Reusable primitives (email, UUID, date)
├── auth.ts       # Authentication schemas
└── [feature].ts  # Feature-specific schemas
```

#### 5.3 Validation Utilities
**File:** `src/lib/validation/index.ts`
- validateFormData() - Server Action validation
- validateJson() - API validation
- formatZodErrors() - Error formatting
- getFirstError() - Single error extraction

### Phase 6: Code Quality Tools

#### 6.1 ESLint Configuration

**File:** `.eslintrc.json`
```json
{
  "extends": ["next/core-web-vitals", "next/typescript", "prettier"],
  "plugins": ["no-restricted-imports"],
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@prisma/*"],
            "message": "Prisma is prohibited. Use TypeORM."
          },
          {
            "group": ["@mui/*", "@material-ui/*"],
            "message": "Material-UI is prohibited. Use shadcn/ui."
          },
          {
            "group": ["@tanstack/*"],
            "message": "TanStack libraries are prohibited."
          }
        ]
      }
    ]
  }
}
```

#### 6.2 Prettier Setup
```bash
npm install --save-dev prettier eslint-config-prettier prettier-plugin-tailwindcss
```

**File:** `.prettierrc`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### 6.3 Pre-commit Hooks
```bash
npm install --save-dev husky lint-staged
npx husky init
```

**File:** `.husky/pre-commit`
```bash
npx lint-staged
```

**Add to package.json:**
```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,mdx,css,html,yml,yaml}": ["prettier --write"]
}
```

### Phase 7: Package.json Scripts

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md,mdx,css,html,yml,yaml}\"",
  "typecheck": "tsc --noEmit",
  "db:migrate": "typeorm-ts-node-commonjs migration:run -d typeorm.config.ts",
  "db:migrate:create": "typeorm-ts-node-commonjs migration:create",
  "db:migrate:revert": "typeorm-ts-node-commonjs migration:revert -d typeorm.config.ts"
}
```

### Phase 8: Documentation

#### 8.1 README.md
Include:
- Project overview
- Technology stack summary
- Quick start guide
- Available scripts
- Architecture reference
- Contributing guidelines

#### 8.2 CONTRIBUTING.md
Include:
- Code of conduct
- Development setup
- Branch naming conventions
- Commit message format
- Technology constraints
- Code review checklist
- PR template

#### 8.3 Pull Request Template
**File:** `.github/PULL_REQUEST_TEMPLATE.md`
- Technology compliance checklist
- Security checklist
- Architecture checklist
- Database changes section

### Phase 9: Project Structure

Complete directory structure:
```
2026ORCR-PROJECT/
├── docs/
│   ├── architecture/
│   │   └── ADR-001-technology-stack.md
│   ├── IMPLEMENTATION_GUIDE.md
│   └── CONTRIBUTING.md
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── common/            # Shared components
│   │   └── features/          # Feature components
│   ├── entities/              # TypeORM entities
│   ├── repositories/          # Data access layer
│   ├── services/              # Business logic
│   ├── schemas/               # Zod validation
│   ├── lib/
│   │   ├── database/          # TypeORM config
│   │   ├── supabase/          # Auth clients
│   │   ├── validation/        # Validation utils
│   │   └── utils.ts           # Utility functions
│   ├── types/                 # TypeScript types
│   ├── migrations/            # DB migrations
│   └── middleware.ts          # Auth middleware
├── .husky/                    # Git hooks
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── .env                       # Environment variables
├── .env.example              # Template
├── .eslintrc.json           # ESLint config
├── .prettierrc               # Prettier config
├── .editorconfig            # Editor config
├── tsconfig.json            # TypeScript config
├── typeorm.config.ts        # TypeORM CLI config
├── tailwind.config.ts       # Tailwind config
├── next.config.ts           # Next.js config
└── package.json             # Dependencies
```

### Phase 10: Verification

#### 10.1 Type Checking
```bash
npm run typecheck
```
Should complete with no errors.

#### 10.2 Linting
```bash
npm run lint
```
Should pass all checks.

#### 10.3 Build
```bash
npm run build
```
Should build successfully.

#### 10.4 Prohibited Import Test
Try importing a prohibited library:
```typescript
import { PrismaClient } from '@prisma/client'; // Should error
```
ESLint should block this import.

## Key Files to Create

### Essential Configuration Files
1. `tsconfig.json` - TypeScript strict mode
2. `.eslintrc.json` - With prohibited imports
3. `.prettierrc` - Code formatting
4. `.editorconfig` - Editor consistency
5. `typeorm.config.ts` - Database CLI
6. `.env.example` - Environment template

### Core Library Files
1. `src/lib/database/data-source.ts`
2. `src/lib/database/base-repository.ts`
3. `src/lib/supabase/auth-client.ts`
4. `src/lib/supabase/auth-server.ts`
5. `src/lib/validation/index.ts`
6. `src/middleware.ts`

### Schema Files
1. `src/schemas/common.ts`
2. `src/schemas/auth.ts`

### Documentation Files
1. `README.md`
2. `CONTRIBUTING.md`
3. `docs/architecture/ADR-001-technology-stack.md`
4. `.github/PULL_REQUEST_TEMPLATE.md`
5. `src/entities/README.md`
6. `src/repositories/README.md`
7. `src/services/README.md`
8. `src/schemas/README.md`
9. `src/components/*/README.md`

## Success Criteria

- ✅ All TypeScript compiles without errors (strict mode)
- ✅ ESLint blocks prohibited technology imports
- ✅ Pre-commit hooks run automatically
- ✅ Project builds successfully
- ✅ Clear documentation for all layers
- ✅ Zero ambiguity in technology choices

## Common Issues and Solutions

### Issue: TypeORM migrations not working
**Solution:** Ensure `ts-node` is installed and typeorm.config.ts is correct

### Issue: Supabase auth cookies not persisting
**Solution:** Verify middleware.ts is handling cookie updates correctly

### Issue: ESLint not blocking prohibited imports
**Solution:** Check eslint-plugin-no-restricted-imports is installed

### Issue: Build fails with type errors
**Solution:** Run `npm run typecheck` to identify specific type issues

## Next Steps After Setup

1. Create first entity (e.g., User)
2. Generate and run first migration
3. Implement first repository
4. Create first service
5. Build first feature with shadcn/ui
6. Add first Server Action with Zod validation
7. Implement authentication flow

## Support

For questions about architectural decisions, refer to ADR-001.
For implementation issues, check this guide first.
For exceptions, follow the process in ADR-001.

---

This implementation establishes a production-ready, secure, and maintainable foundation with zero architectural ambiguity.
