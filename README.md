# Freelii - Non-Custodial Crypto Wallet

Freelii is a non-custodial crypto wallet built on the Stellar blockchain, designed for **remittances, P2P payments, and DeFi access** through messaging platforms like **Viber and Telegram**. It combines advanced blockchain capabilities with a familiar user experience via chatbot UIs inside social platforms.

## What is Freelii?

Freelii makes decentralized financial services accessible to everyday users, especially in remittance-heavy, underbanked regions like the Philippines and Mexico. Users can onboard without needing to understand crypto complexities—unlocking global financial services in a simple, secure, and localized way.

**Key Features:**
- 🧩 **No browser or wallet extensions** — onboarding via chat apps
- 🔒 **PassKey-based security** — no private key management
- 🤖 **Chatbot-first UX** — familiar, friendly, localized onboarding
- 💸 **Fiat On/Off ramps** — direct access via local partners (Coins.ph, GCash, PayMaya)
- 🔁 **Customizable flows** — using Soroban smart contracts

## Architecture

This is a Turborepo monorepo with multiple applications and shared packages:

### Apps and Packages

- **`apps/web`**: Main Next.js application with dashboard, authentication, and wallet functionality
- **`apps/payments-server`**: Express.js API server for wallet operations and payment processing
- **`apps/docs`**: Documentation site
- **`apps/cli`**: Command-line interface tool
- **`packages/ui`**: Shared React component library with Tailwind CSS
- **`packages/utils`**: Shared utility functions and constants
- **`packages/anchors`**: Stellar anchor services for fiat on/off ramps
- **`contracts/`**: Rust-based Soroban smart contracts and SDK

### Tech Stack

- **Frontend**: Next.js 15, React 18, tRPC, TanStack Query, Tailwind CSS
- **Backend**: Express.js, tRPC, Prisma ORM, PostgreSQL
- **Blockchain**: Stellar SDK, Soroban smart contracts (Rust)
- **Authentication**: NextAuth.js with PassKey support
- **Monorepo**: Turborepo with pnpm workspace
- **Database**: PostgreSQL with Prisma migrations

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Configure your DATABASE_URL and other required environment variables

# Set up database
pnpm db:push
```

### Development

To develop all apps and packages:

```bash
pnpm dev
```

To develop specific apps:

```bash
# Web app only
pnpm --filter web dev

# Payments server only
pnpm --filter payments-server dev
```

### Build

To build all apps and packages:

```bash
pnpm build
```

### Database Operations

```bash
pnpm db:generate    # Generate Prisma client after schema changes
pnpm db:migrate     # Run Prisma migrations in development
pnpm db:push        # Push schema changes to database
pnpm db:studio      # Open Prisma Studio
```

## Key Integrations

- **Stellar Blockchain**: Core wallet functionality, PassKey authentication
- **Circle USDC**: Stablecoin operations
- **Soroban Smart Contracts**: Custom automation and DeFi flows
- **Anchor Partners**: Coins.ph, GCash, PayMaya for fiat on/off ramps
- **AI Services**: Anthropic AI for CSV mapping and user assistance

## Target Markets

- 🇵🇭 **Philippines**: $37B remittance market, 71% Viber penetration
- 🇲🇽 **Mexico** (expansion): Strong appetite for crypto among users

## Development Commands

### Linting and Type Checking

```bash
pnpm lint           # Lint all packages
pnpm typecheck      # TypeScript type checking
pnpm format         # Format code with Prettier
```

### Testing

```bash
# Check package.json files for specific test commands
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint` and `pnpm typecheck`
5. Submit a pull request

## License

This project is licensed under the MIT License.
