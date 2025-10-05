# CLAUDE.md

> **AI Agent Guide for Operator Network**  
> Essential context for AI assistants (Claude Code, GPT, Cursor) to provide accurate, secure assistance.
>
> **FOR CLAUDE CODE**: This file is your project memory. Read this before making any changes.
> Use `/init-claude` to regenerate if this file gets out of sync with the codebase.

---

## 🎯 Core Principles (Non-Negotiable)

1. **Security First** - Every decision prioritizes security over convenience
2. **Transparency** - All critical operations auditable on-chain
3. **Immutability** - Critical data stored on Solana blockchain
4. **Scalability** - Hybrid on-chain + off-chain architecture

---

## 📋 Project Quick Facts

- **Purpose:** Decentralized identity and reputation for web3 operators
- **Phase:** MVP Phase 1 (6-week sprint)
- **Blockchain:** Solana (◎0.00025/tx, sub-second finality)
- **Stack:** Vite + React 18 + TypeScript + Anchor + Firebase
- **Architecture:** Hybrid (critical data on-chain, metadata off-chain)

---

## 🏗️ Architecture

### Hybrid Storage Strategy
```
ON-CHAIN (Solana)          OFF-CHAIN (Firebase)
├─ Wallet → PDA mapping    ├─ Profile metadata (bio, links)
├─ Handle registration     ├─ Search indexes (Algolia)
├─ XP values              ├─ Activity logs
└─ State changes          └─ High-frequency updates

Cost: ◎0.00025/tx         Cost: Pay-as-you-go
Speed: <1s finality       Speed: Real-time listeners
```

### Repository Structure
```
operator-network/
├── /programs              # Anchor smart contracts
│   ├── operator-registry  # Core identity program
│   └── tests             # Anchor tests
├── /src                   # Vite + React frontend
│   ├── /components       # UI components
│   ├── /lib              
│   │   ├── /solana       # Program interactions
│   │   ├── /api          # tRPC client
│   │   └── /validation   # Zod schemas
│   └── /stores           # State management
└── /tests                # Vitest + Playwright
```

---

## 🔑 Core Data Models

### On-Chain (Anchor/Rust)
```rust
#[account]
pub struct Operator {
    pub wallet: Pubkey,      // 32 bytes
    pub handle: String,      // 4+20 bytes
    pub xp: u64,            // 8 bytes
    pub skills: Vec<String>, // 4+120 bytes
    pub active: bool,        // 1 byte
    pub bump: u8,           // 1 byte
}
// PDA seeds: ["operator", wallet_pubkey]
```

### Off-Chain (Firebase Firestore)
```typescript
interface OperatorProfile {
  walletAddress: string;     // Document ID
  handle: string;            // Indexed for uniqueness
  skills: SkillTag[];
  bio?: string;
  pdaAddress: string;        // Synced from Solana
  lastSyncedSlot: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore collection: operators/{walletAddress}
// Indexes: handle (unique), skills (array-contains)
```

**Skill Taxonomy:** `Dev`, `Design`, `VibeOps`, `BizOps`, `Narrative`, `Coordination`

---

## 🛠️ Development Standards

### File Organization (Critical for Claude Code)
```
When editing or creating files:
├── /programs/*.rs        → Always run `anchor build` after changes
├── /src/components/*.tsx → Always export with named exports
├── /src/lib/solana/*.ts  → Must include error handling
├── /src/lib/validation/*.ts → Must use Zod schemas
└── firestore.rules       → Update after any collection changes
```

### Naming Conventions
```typescript
// Components & Files
<OperatorCard />           // PascalCase
OperatorCard.tsx
useOperatorData.ts         // Hooks: use prefix
operator_registry.rs       // Rust: snake_case

// Variables
const operatorData = {}    // camelCase
const MAX_SKILLS = 5       // UPPER_SNAKE_CASE
const OPERATOR_SEED = "operator"  // PDA seeds
```

### Code Patterns

**React:**
- Functional components only
- TanStack Query for server state
- Zustand for client state (if needed)
- Explicit TypeScript types

**Validation:**
```typescript
// Use Zod everywhere (client + server)
const HandleSchema = z.string()
  .min(3).max(20)
  .regex(/^[a-zA-Z0-9_]+$/);
```

**Database:**
```typescript
// Use Firebase Admin SDK server-side
import { getFirestore } from 'firebase-admin/firestore';

// ✅ GOOD: Firestore queries (automatically parameterized)
const db = getFirestore();
const operatorRef = db.collection('operators').doc(walletAddress);
const operator = await operatorRef.get();

// ✅ GOOD: Query with where clause
const operators = await db.collection('operators')
  .where('handle', '==', handle)
  .limit(1)
  .get();

// ❌ BAD: Never construct queries from strings
// Firestore handles this automatically, but still validate inputs with Zod
```

---

## 🔐 Security Requirements (Critical)

### Authentication Flow
```typescript
1. User connects Solana wallet
2. Request nonce from server
3. Sign message with wallet
4. Verify signature server-side (bs58 encoding)
5. Issue JWT with wallet address
```

### Security Checklist (Every PR)
- [ ] Zod validation on all inputs (client + server)
- [ ] Firebase Security Rules defined for collections
- [ ] Wallet signatures verified server-side
- [ ] No secrets in code (use env vars)
- [ ] Rate limiting on tRPC endpoints
- [ ] Anchor account constraints defined
- [ ] `npm audit` shows no critical issues
- [ ] Firestore indexes created for queries

### Never Do This
```typescript
// ❌ Trust client validation alone
// ❌ Raw SQL with string interpolation
// ❌ Store private keys anywhere
// ❌ Skip signature verification
// ❌ Hardcode secrets in code
```

---

## 🔗 Solana Integration Patterns

### When to Use On-Chain vs Off-Chain

**ON-CHAIN:** Wallet mapping, handle registration, XP values, state changes  
**OFF-CHAIN:** Metadata, activity logs, search indexes, high-frequency updates  

**Why?** Solana's ◎0.00025/tx makes on-chain practical for more data than Ethereum

### Key Patterns

**1. PDA Derivation (Deterministic)**
```typescript
const [operatorPda] = PublicKey.findProgramAddressSync(
  [Buffer.from('operator'), wallet.publicKey.toBuffer()],
  programId
);
```

**2. Optimistic UI**
```typescript
// Update UI immediately
queryClient.setQueryData(['operator'], newData);

// Confirm on-chain
const tx = await program.methods.updateXp(xp).rpc();
await connection.confirmTransaction(tx, 'confirmed');

// Sync to Firebase
const db = getFirestore();
await db.collection('operators').doc(walletAddress).update({
  xp: newData.xp,
  lastSyncedSlot: await connection.getSlot(),
  updatedAt: FieldValue.serverTimestamp(),
});
```

**3. Transaction Verification**
```typescript
// Always provide explorer link
const explorerUrl = `https://solscan.io/tx/${signature}`;
```

---

## 🧪 Testing Strategy

### Test Priorities
1. **Critical paths** (100% coverage): Auth, profile creation, queries
2. **Solana programs** (Anchor tests): All instructions, error cases
3. **Integration** (Vitest): End-to-end flows
4. **E2E** (Playwright): User journeys

```typescript
// Anchor test example
it('prevents duplicate registration', async () => {
  await program.methods.registerOperator('alice', []).rpc();
  
  try {
    await program.methods.registerOperator('alice', []).rpc();
    expect.fail('Should have thrown');
  } catch (err) {
    expect(err.message).includes('Already registered');
  }
});
```

---

## 🚦 MVP Scope

### ✅ Phase 1 (Current - 6 weeks)
- Wallet connection (Phantom, Solflare, Backpack)
- Registration (creates PDA on Solana + metadata in Firebase)
- Dashboard (view profile, stats)
- Directory (search via Algolia, filter by skills)
- Static XP (always 0 for now)
- Real-time updates (Firebase listeners)

### 🔄 Phase 2 (Next)
- Dynamic XP system
- Reputation milestones
- Machine connections
- Helius webhooks
- Profile verification UI

### ❌ Out of Scope
Profile editing, messaging, social graph, mobile app, cross-chain

---

## 🐛 Common Issues & Solutions

### Wallet Won't Connect
```typescript
// Check adapter availability
if (!wallet) throw new Error('No wallet selected');

// Add timeout
await Promise.race([
  connect(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 10000)
  )
]);
```

### Transaction Fails
```typescript
// Check balance first
const balance = await connection.getBalance(wallet.publicKey);
if (balance < 5000) throw new Error('Need ◎0.000005 for fees');

// Simulate before sending
const simulation = await connection.simulateTransaction(tx);
if (simulation.value.err) throw new Error('Will fail');
```

### Sync Issues
```typescript
// Use Helius webhooks for real-time sync
// Fallback: Poll every 15s for critical data
```

---

## 🤝 AI Assistant Guidelines

### For Claude Code Specifically

**When you start a task:**
1. Check this file first (you're reading it now ✓)
2. Review related files in the section you're working on
3. Check if tests exist for what you're modifying
4. Verify you have the right environment variables

**When editing code:**
- Always read the full file before making changes
- Run tests after modifications: `npm test` or `anchor test`
- Update related documentation if you change behavior
- Add error handling for all external calls (Solana, Firebase, APIs)

**When you're stuck:**
- Use `/help` to see available commands
- Use `/compact` if context is getting too large
- Check the Common Issues section below
- Ask clarifying questions before making assumptions

### When Generating Code
- **Security first:** Validate everything, verify signatures
- **Document everything:** Add JSDoc/rustdoc comments (see below)
- Use TypeScript strict mode
- Follow Anchor best practices for programs
- Add error handling and loading states
- Include transaction explorer links

### Documentation Requirements (Mandatory)

**Every function/component MUST have:**
```typescript
/**
 * Brief one-line description
 * 
 * Detailed explanation of what this does and why.
 * Include security considerations if applicable.
 * 
 * @param paramName - What this parameter does
 * @returns What this returns
 * 
 * @example
 * const result = await functionName(param);
 */
```

**Rust programs MUST have:**
```rust
/// Brief description
/// 
/// # Arguments
/// * `param` - Description
/// 
/// # Errors
/// Returns error if...
/// 
/// # Security
/// This function validates...
```

**Complex logic MUST have inline comments explaining WHY:**
```typescript
// We sync every 100 XP instead of real-time to minimize 
// on-chain transactions and keep costs predictable
if (newXP % 100 === 0) {
  await syncToChain();
}
```

**When to document:**
- ✅ Every exported function/component
- ✅ Non-obvious business logic
- ✅ Security-critical sections
- ✅ Complex algorithms
- ✅ API endpoints (tRPC procedures)
- ❌ Self-explanatory code (don't over-comment)

### When Debugging
1. Check Common Issues section first
2. Verify wallet connection state
3. Check Solana transaction logs
4. Verify Firebase Security Rules
5. Check Firestore indexes
6. Test on devnet before mainnet

### When Suggesting Features
1. Check MVP scope (don't add out-of-scope features)
2. Consider on-chain vs off-chain tradeoffs
3. Estimate transaction costs (◎0.00025 each)
4. Maintain security principles
5. Ensure transparency (provide proof links)

### Critical Rules
✅ Always validate inputs with Zod  
✅ Verify wallet signatures server-side  
✅ Use PDAs for deterministic accounts  
✅ Provide Solscan links for transactions  
✅ Check balance before transactions  
✅ **Document all functions with JSDoc/rustdoc**  
✅ **Explain WHY, not just WHAT in comments**  
✅ **Define Firebase Security Rules for all collections**  
❌ Never trust client-side validation alone  
❌ Never skip security for speed  
❌ Never query Firestore without validation  
❌ Never commit undocumented code  

---

## 📚 Key Resources

### Documentation
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [tRPC](https://trpc.io/)

### Tools
- Solscan (explorer)
- Helius (RPC + webhooks)
- Phantom/Solflare (wallets)

---

## 🎯 Quick Reference Card

**READ THIS FIRST when starting any task in Claude Code**

```
PROJECT:         Operator Network (Web3 Identity)
BLOCKCHAIN:      Solana (◎0.00025/tx, <1s finality)
FRONTEND:        Vite + React 18 + TypeScript
BACKEND:         tRPC + Firebase (Firestore + Auth + Functions)
PROGRAMS:        Anchor (Rust)
TESTING:         Vitest + Anchor Test + Playwright
VALIDATION:      Zod (everywhere)

BEFORE YOU CODE:
1. Read this CLAUDE.md file (✓ you did!)
2. Check if tests exist for this code
3. Verify related files won't break
4. Confirm you understand the "why"

AFTER YOU CODE:
1. Run relevant tests
2. Update documentation
3. Check security implications
4. Verify Firebase rules if touching Firestore

SECURITY RULES (NON-NEGOTIABLE):
✓ Validate all inputs (Zod)
✓ Verify wallet signatures
✓ Define Firestore Security Rules
✓ Rate limit endpoints
✗ Never trust client alone
✗ Never skip validation
✗ Never hardcode secrets

DOCUMENTATION RULES (MANDATORY):
✓ JSDoc on all exported functions
✓ Rustdoc on all Anchor instructions
✓ Explain WHY in complex logic
✓ Security notes on critical paths
✗ Never commit undocumented code
✗ Don't state the obvious

WHEN STUCK:
1. /help - See Claude Code commands
2. /compact - Reduce context size
3. Check Common Issues section above
4. Review TECH_STACK.md
5. Check Anchor/Solana/Firebase docs
6. Test on devnet before mainnet

CRITICAL FILES TO NEVER BREAK:
- firestore.rules (Firebase Security Rules)
- programs/*/lib.rs (Anchor programs)
- src/lib/solana/programId.ts (Program ID)
- .env.example (Environment template)
```

---

## 📞 Getting Help

**GitHub Issues:** Technical bugs  
**GitHub Discussions:** Questions  
**Discord:** Real-time support  
**Security:** security@operatornetwork.xyz (private disclosure)

---

**Last Updated:** 2025-10-06  
**Maintained By:** Operator Network Core Team  
**License:** MIT

---

## 🔄 Progressive Decentralization Roadmap

**Phase 1** (Current): Hybrid with critical data on-chain  
**Phase 2** (6 months): More data on-chain, IPFS for media  
**Phase 3** (1 year): DAO governance, community infrastructure

---

**Remember:** Security and transparency are not optional. In web3, they're the foundation.