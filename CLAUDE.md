# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Freelii is a non-custodial crypto wallet built on the Stellar blockchain, designed for remittances, P2P payments, and DeFi access through messaging platforms like Viber and Telegram. It's a Turborepo monorepo with multiple applications and shared packages.

## Architecture

### Monorepo Structure
- **apps/web**: Main Next.js application with dashboard, authentication, and wallet functionality
- **apps/payments-server**: Express.js API server for wallet operations and payment processing
- **apps/docs**: Documentation site
- **apps/cli**: Command-line interface tool
- **packages/ui**: Shared React component library with Tailwind CSS
- **packages/utils**: Shared utility functions and constants
- **packages/anchors**: Stellar anchor services for fiat on/off ramps
- **contracts/**: Rust-based Soroban smart contracts and SDK

### Tech Stack
- **Frontend**: Next.js 15, React 18, tRPC, TanStack Query, Tailwind CSS
- **Backend**: Express.js, tRPC, Prisma ORM, PostgreSQL
- **Blockchain**: Stellar SDK, Soroban smart contracts (Rust)
- **Authentication**: NextAuth.js with PassKey support
- **Monorepo**: Turborepo with pnpm workspace
- **Database**: PostgreSQL with Prisma migrations

### Key Services Architecture
The web app follows a service-oriented architecture:
- **Server Services** (apps/web/src/server/services/):
  - `orchestrator/`: Payment orchestration and settlement processing
  - `wallet/`: Stellar wallet operations and transaction management
  - `bulk-disbursement/`: Batch payment processing
  - `client/`: Client management with schemas
  - `invoicing/`: Invoice creation and management
  - `soroban/`: Smart contract webhook handling
  - `stellar/`: Core Stellar blockchain operations
  - `user/`: User account management
  - `email/`: Email service integration

## Development Commands

### Root Level (Turborepo)
```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps and packages
pnpm lint         # Lint all packages
pnpm format       # Format code with Prettier
```

### Web App (apps/web)
```bash
pnpm dev                    # Next.js development server with Turbo
pnpm build                  # Production build
pnpm start                  # Start production server
pnpm preview               # Build and start production server
pnpm lint                  # ESLint
pnpm lint:fix              # ESLint with auto-fix
pnpm typecheck             # TypeScript type checking
pnpm check                 # Run lint and typecheck together
pnpm format:check          # Check code formatting
pnpm format:write          # Format code with Prettier

# Database operations
pnpm db:generate           # Generate Prisma client after schema changes
pnpm db:migrate            # Run Prisma migrations in development
pnpm db:push               # Push schema changes to database
pnpm db:studio             # Open Prisma Studio

# UI components
pnpm shadcn:install        # Install new shadcn/ui components
```

### Payments Server (apps/payments-server)
This is a standalone Express.js API for wallet operations.

### Testing
No specific test commands found in package.json files - check for test frameworks in the codebase if needed.

## Key Integrations

- **Stellar Blockchain**: Core wallet functionality, PassKey authentication
- **Circle USDC**: Stablecoin operations
- **Soroban Smart Contracts**: Custom automation and DeFi flows
- **Anchor Partners**: Coins.ph, GCash, PayMaya for fiat on/off ramps
- **AI Services**: Anthropic AI for CSV mapping (apps/web/src/lib/ai/)

## Database Schema

Uses Prisma with PostgreSQL. Key models include:
- User management with NextAuth.js integration
- Wallet addresses and blockchain accounts
- Payment transactions and bulk disbursements
- Client management and invoicing

Always run `pnpm db:generate` after modifying the Prisma schema.

## Environment Setup

- Uses Next.js environment variables with @t3-oss/env-nextjs for validation
- Database requires PostgreSQL connection via DATABASE_URL
- Requires various API keys for blockchain and payment integrations

## Code Organization

- **tRPC Routers**: Organized by domain (user, wallet, invoicing, etc.)
- **UI Components**: Shared in packages/ui with shadcn/ui base
- **Service Layer**: Domain-driven services with schema validation
- **Type Safety**: Full TypeScript coverage with strict configuration