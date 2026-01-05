# Pull Request

## Description

Please provide a brief description of the changes in this PR.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Technology Compliance

- [ ] I have reviewed the [Architecture Decision Record](../docs/architecture/ADR-001-technology-stack.md)
- [ ] I have only used approved technologies
- [ ] I have not introduced any prohibited dependencies (Prisma, Material-UI, TanStack)
- [ ] ESLint passes without errors

## Security Checklist

- [ ] No service_role key exposed in frontend code
- [ ] Using anon public key for client-side Supabase operations
- [ ] Row Level Security (RLS) policies created for new tables
- [ ] No hardcoded secrets or API keys
- [ ] Proper error handling implemented

## Code Quality

- [ ] TypeScript strict mode compliance
- [ ] No `any` types (or properly justified)
- [ ] Code formatted with Prettier
- [ ] ESLint passes without warnings
- [ ] All imports follow project structure

## Testing

- [ ] Existing tests pass
- [ ] New tests added for new functionality
- [ ] Edge cases covered
- [ ] Error handling tested

## Architecture

- [ ] Follows layer separation (entities, repositories, services, components)
- [ ] Uses proper repository pattern for data access
- [ ] Zod schemas created for validation
- [ ] TypeORM entities properly decorated

## Documentation

- [ ] Code comments added where necessary
- [ ] README updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] Migration guide provided (for breaking changes)

## Screenshots (if applicable)

Please add screenshots for UI changes.

## Related Issues

Closes #(issue number)

## Additional Notes

Any additional information that reviewers should know.
