# Contributing to Technical Governance Framework

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Technology Stack

This project follows strict technology governance rules. Please review the [Architecture Decision Record](docs/architecture/ADR-001-technology-stack.md) before contributing.

### Approved Technologies

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Backend**: Supabase (Auth only), TypeORM
- **Database**: PostgreSQL
- **Validation**: Zod

### Prohibited Technologies

The following technologies are **NOT allowed** and will be blocked by ESLint:

- Prisma (use TypeORM instead)
- Material-UI / MUI (use shadcn/ui instead)
- TanStack Query / TanStack Table (use native alternatives)

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your values
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`

## Code Quality Standards

### TypeScript

- Strict mode is enabled
- Avoid using `any` type
- Use proper type annotations
- Enable all strict compiler options

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Use functional components with hooks
- Prefer named exports over default exports

### Commit Guidelines

- Pre-commit hooks will run automatically
- All code must pass ESLint checks
- All code must be formatted with Prettier
- Write clear, descriptive commit messages

## Architecture Principles

### Layer Separation

1. **Entities**: TypeORM entities (database models)
2. **Repositories**: Data access layer
3. **Services**: Business logic layer
4. **Components**: UI layer
5. **Schemas**: Validation layer (Zod)

### File Organization

- Keep files focused and manageable
- Use the single responsibility principle
- Group related functionality
- Avoid large monolithic files

## Supabase Usage

### Critical Security Rules

- **NEVER** use the service_role key in frontend code
- **ALWAYS** use the anon public key for client-side operations
- **MANDATORY** Row Level Security (RLS) on all database tables
- **REQUIRED** Supabase policies for data access control

### Authentication

- Use Supabase for authentication ONLY
- All auth operations must use the Supabase client
- Implement proper error handling
- Add loading states for all auth operations

### Database Operations

- Use TypeORM for all database operations
- Create proper entities with decorators
- Use the repository pattern
- Avoid direct SQL queries when possible

## Testing

- Write unit tests for business logic
- Test error handling and edge cases
- Ensure proper cleanup in tests

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run typecheck` and `npm run lint`
5. Commit your changes (pre-commit hooks will run)
6. Push to your fork
7. Create a Pull Request

### PR Requirements

- All tests must pass
- Code must be formatted with Prettier
- No ESLint errors
- TypeScript must compile without errors
- Clear description of changes
- Reference any related issues

## Questions?

If you have questions about contributing, please:

1. Review the [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md)
2. Check the [Quickstart Guide](docs/QUICKSTART.md)
3. Review existing code examples
4. Open an issue for discussion

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.
