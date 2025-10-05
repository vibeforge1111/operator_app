# Operator Network Tech Stack

## Core Principles
- **Security First**: Every decision prioritizes security
- **Transparency**: All operations auditable on-chain
- **Immutability**: Critical data stored on blockchain
- **Scalability**: Hybrid approach (on-chain + off-chain)

## Frontend Stack

### Build & Dev
- **Vite** - Lightning fast HMR, ESBuild, optimal bundling
- **React 18** - Proven, extensive ecosystem
- **TypeScript** - Type safety across the entire stack
- **TanStack Query** - Caching, synchronization, background updates

### Web3 Integration
- **@solana/web3.js** - Official Solana JavaScript SDK
- **@solana/wallet-adapter-react** - React hooks for Solana wallets
- **@solana/wallet-adapter-wallets** - Support for all major Solana wallets
- **@solana/spl-token** - SPL token interactions

### UI & Styling
- **Tailwind CSS** - Utility-first, performant
- **Radix UI** - Accessible, unstyled components
- **Framer Motion** - Smooth animations

## Backend Stack

### Programs (Smart Contracts)
- **Solana Blockchain** - Sub-second finality, $0.00025 per transaction
- **Anchor Framework** - Type-safe Rust programs with built-in security
- **Program Derived Addresses (PDAs)** - Deterministic account generation
- **Metaplex** - NFT and metadata standards for operator badges

### Hybrid Storage Strategy
```
┌─────────────────────────────────────┐
│         ON-CHAIN (Immutable)        │
│ • Operator wallet addresses         │
│ • Handle registration               │
│ • XP/reputation checkpoints         │
│ • Fee routing rules                 │
│ • Critical operator actions         │
└─────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────┐
│        OFF-CHAIN (Scalable)         │
│ • Profile metadata                  │
│ • Skill tags                        │
│ • Activity logs                     │
│ • Search indices                    │
│ • Real-time updates                 │
└─────────────────────────────────────┘
```

### Off-Chain Infrastructure
- **Supabase** - PostgreSQL + Real-time + Auth
  - Row Level Security (RLS) for data isolation
  - Real-time subscriptions for live updates
  - Built-in auth with wallet signatures
- **Shadow Drive** or **Arweave** - Solana-native permanent storage
- **Helius** or **Shyft** - Solana RPC with webhooks and indexing
- **DAS API** - Compressed NFT metadata

### API Layer
- **tRPC** - End-to-end typesafe APIs
- **Next.js API Routes** - Serverless functions
- **Zod** - Runtime validation for all inputs

## Security Architecture

### Authentication Flow
```typescript
1. User connects wallet (client)
2. Request nonce from server
3. Sign message with wallet
4. Verify signature server-side
5. Issue JWT with wallet address
6. All API calls include JWT
```

### Security Measures
- **Content Security Policy (CSP)** headers
- **Rate limiting** on all endpoints
- **Input sanitization** with DOMPurify
- **Wallet signature verification** for all writes
- **Multi-sig treasury** for fee collection
- **Audit trail** for all operator actions

## Data Models

### On-Chain Program (Anchor/Rust)
```rust
// Account structure for each operator
#[account]
pub struct Operator {
    pub wallet: Pubkey,
    pub handle: String,
    pub xp: u64,
    pub registered_at: i64,
    pub active: bool,
    pub skills: Vec<String>,
    pub bump: u8,
}

// PDA seeds: ["operator", wallet_pubkey]
```

### Off-Chain Extended Profile
```typescript
interface OperatorProfile {
  // From blockchain
  walletAddress: string;
  handle: string;
  xp: number;

  // Off-chain metadata
  skills: SkillTag[];
  bio?: string;
  machines: MachineConnection[];
  activeOps: Operation[];
  socials?: SocialLinks;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}
```

## Monitoring & Analytics
- **Sentry** - Error tracking
- **Mixpanel/PostHog** - User analytics (privacy-first)
- **Grafana** - System metrics
- **Ironforge** - Solana program monitoring and alerts

## Development Workflow

### Local Development
```bash
# Frontend
npm create vite@latest operator-network -- --template react-ts
cd operator-network
npm install

# Smart Contracts
forge init contracts
cd contracts
forge build
forge test
```

### Testing Strategy
- **Vitest** - Unit tests (Vite native)
- **Playwright** - E2E testing
- **Anchor Test** - Solana program testing
- **Bankrun** - Local Solana validator for testing
- **@solana-developers/helpers** - Testing utilities

## Deployment Strategy

### Progressive Decentralization
1. **Phase 1**: Hybrid model (current plan)
   - Critical data on-chain
   - Metadata in PostgreSQL

2. **Phase 2**: Increased decentralization
   - Move profiles to IPFS
   - Implement DAO governance

3. **Phase 3**: Full decentralization
   - All data on-chain or IPFS
   - Community-run infrastructure

### Infrastructure
- **Vercel** - Frontend hosting (excellent Vite support)
- **Helius/QuickNode** - Solana RPC with GenesysGo fallback
- **Cloudflare** - DDoS protection, CDN
- **AWS KMS** - Secure key management for treasury

## Cost Optimization
- **Solana advantages**: $0.00025 per tx, no gas wars
- **State compression** - Merkle trees for operator data
- **Lookup tables** - Reduce transaction size
- **Priority fees** - Only when needed
- **Octane** - Gasless transactions for onboarding
- Cache aggressively with TanStack Query
- Use CDN for all static assets

## Why This Stack?

1. **Vite + React + TypeScript**: Modern, fast, type-safe
2. **Solana**: Sub-second finality, $0.00025 transactions
3. **Anchor Framework**: Type-safe programs with built-in security
4. **Hybrid Storage**: Balances decentralization with UX
5. **Supabase + Shadow Drive**: Real-time updates + permanent storage
6. **Progressive Decentralization**: Start practical, evolve to fully decentralized