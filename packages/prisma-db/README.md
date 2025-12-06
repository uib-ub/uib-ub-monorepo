# Prisma Shared Package

This package contains the shared Prisma schema and client for the monorepo.

## Usage

Import the Prisma client:

```typescript
import { prisma } from 'prisma/client'
```

## Development

Generate the Prisma client:

```bash
npm run db:generate
```

Run migrations:

```bash
npm run db:migrate
```

