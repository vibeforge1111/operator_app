# SECURITY.md

> **Security Implementation Guide for Operator Network**  
> This document outlines security requirements, implementation patterns, and best practices.

---

## 🎯 Security Principles

Our security model follows these non-negotiable principles:

1. **Security First** - Every decision prioritizes security over convenience
2. **Transparency** - All critical operations auditable on-chain
3. **Immutability** - Critical data stored on Solana blockchain
4. **Defense in Depth** - Multiple layers of security validation

**Security Score Target:** 9/10 before mainnet launch

---

## 🔴 Critical Security Requirements (MUST IMPLEMENT)

### 1. Firebase Security Rules

**Status:** 🔴 NOT IMPLEMENTED - BLOCKING LAUNCH  
**Priority:** P0 - Must complete before MVP launch  
**Estimated Time:** 2 hours

#### Implementation

Create `firestore.rules` in project root:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(walletAddress) {
      return isAuthenticated() && request.auth.uid == walletAddress;
    }
    
    function hasValidHandle() {
      let handle = request.resource.data.handle;
      return handle is string 
        && handle.size() >= 3 
        && handle.size() <= 20
        && handle.matches('^[a-zA-Z0-9_]+$');
    }
    
    function hasValidSkills() {
      let skills = request.resource.data.skills;
      return skills is list 
        && skills.size() >= 1 
        && skills.size() <= 5;
    }
    
    function hasRequiredFields() {
      let data = request.resource.data;
      return data.keys().hasAll([
        'walletAddress', 
        'handle', 
        'skills', 
        'pdaAddress',
        'createdAt',
        'updatedAt'
      ]);
    }
    
    // Operators collection
    match /operators/{walletAddress} {
      // Anyone can read profiles (public directory)
      allow read: if true;
      
      // Only authenticated users can create their own profile
      allow create: if isOwner(walletAddress)
        && request.resource.data.walletAddress == walletAddress
        && hasValidHandle()
        && hasValidSkills()
        && hasRequiredFields()
        && request.resource.data.xp == 0  // Must start at 0
        && request.resource.data.active == true;
      
      // Only the owner can update their profile
      allow update: if isOwner(walletAddress)
        && request.resource.data.walletAddress == resource.data.walletAddress  // Can't change wallet
        && request.resource.data.handle == resource.data.handle  // Can't change handle (MVP)
        && hasValidSkills();
      
      // No deletes (immutability principle)
      allow delete: if false;
    }
    
    // Activity logs (append-only)
    match /activity/{activityId} {
      allow read: if true;
      allow create: if isAuthenticated()
        && request.resource.data.walletAddress == request.auth.uid;
      allow update, delete: if false;  // Append-only
    }
    
    // Handle claims (for uniqueness checking)
    match /handles/{handle} {
      allow read: if true;
      allow create: if isAuthenticated()
        && request.resource.data.walletAddress == request.auth.uid
        && !exists(/databases/$(database)/documents/handles/$(handle));
      allow update, delete: if false;
    }
  }
}
```

#### Testing Firebase Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase emulator
firebase init emulators

# Run security rules tests
firebase emulators:start --only firestore

# Test with Firebase Rules Playground
# https://console.firebase.google.com -> Firestore -> Rules -> Playground
```

#### Deployment

```bash
# Deploy rules to production
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules:get
```

---

### 2. On-Chain Handle Uniqueness

**Status:** 🔴 NOT IMPLEMENTED - RACE CONDITION VULNERABILITY  
**Priority:** P0 - Critical security issue  
**Estimated Time:** 4 hours

#### Problem

Firebase cannot guarantee atomic uniqueness checks across distributed writes. Two users could claim the same handle simultaneously.

#### Solution: Use PDA with Handle Seed

Update your Anchor program:

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere");

#[program]
pub mod operator_registry {
    use super::*;

    pub fn register_operator(
        ctx: Context<RegisterOperator>,
        handle: String,
        skills: Vec<String>,
    ) -> Result<()> {
        // Validation
        require!(
            handle.len() >= 3 && handle.len() <= 20,
            ErrorCode::InvalidHandleLength
        );
        
        require!(
            handle.chars().all(|c| c.is_alphanumeric() || c == '_'),
            ErrorCode::InvalidHandleFormat
        );
        
        require!(
            skills.len() >= 1 && skills.len() <= 5,
            ErrorCode::InvalidSkillsCount
        );
        
        // Initialize handle claim (ensures uniqueness)
        let handle_claim = &mut ctx.accounts.handle_claim;
        handle_claim.owner = ctx.accounts.signer.key();
        handle_claim.handle = handle.clone();
        handle_claim.bump = ctx.bumps.handle_claim;
        
        // Initialize operator account
        let operator = &mut ctx.accounts.operator;
        operator.wallet = ctx.accounts.signer.key();
        operator.handle = handle;
        operator.skills = skills;
        operator.xp = 0;
        operator.registered_at = Clock::get()?.unix_timestamp;
        operator.active = true;
        operator.bump = ctx.bumps.operator;
        
        emit!(OperatorRegistered {
            wallet: ctx.accounts.signer.key(),
            handle: operator.handle.clone(),
            pda: ctx.accounts.operator.key(),
            timestamp: operator.registered_at,
        });
        
        Ok(())
    }
    
    pub fn update_xp(
        ctx: Context<UpdateXP>,
        new_xp: u64,
    ) -> Result<()> {
        let operator = &mut ctx.accounts.operator;
        
        require!(
            ctx.accounts.authority.key() == operator.wallet,
            ErrorCode::Unauthorized
        );
        
        operator.xp = new_xp;
        operator.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(XPUpdated {
            wallet: operator.wallet,
            old_xp: operator.xp,
            new_xp,
            timestamp: operator.updated_at,
        });
        
        Ok(())
    }
}

// Account structures
#[account]
pub struct HandleClaim {
    pub owner: Pubkey,      // 32
    pub handle: String,     // 4 + 20
    pub bump: u8,          // 1
}

impl HandleClaim {
    pub const INIT_SPACE: usize = 8 + 32 + 4 + 20 + 1;
}

#[account]
pub struct Operator {
    pub wallet: Pubkey,           // 32
    pub handle: String,           // 4 + 20
    pub xp: u64,                 // 8
    pub skills: Vec<String>,     // 4 + (5 * 24) = 124
    pub registered_at: i64,      // 8
    pub updated_at: i64,         // 8
    pub active: bool,            // 1
    pub bump: u8,               // 1
}

impl Operator {
    pub const INIT_SPACE: usize = 8 + 32 + 24 + 8 + 124 + 8 + 8 + 1 + 1;
}

// Context structs
#[derive(Accounts)]
#[instruction(handle: String)]
pub struct RegisterOperator<'info> {
    #[account(
        init,
        payer = signer,
        space = HandleClaim::INIT_SPACE,
        seeds = [b"handle", handle.as_bytes()],
        bump
    )]
    pub handle_claim: Account<'info, HandleClaim>,
    
    #[account(
        init,
        payer = signer,
        space = Operator::INIT_SPACE,
        seeds = [b"operator", signer.key().as_ref()],
        bump
    )]
    pub operator: Account<'info, Operator>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateXP<'info> {
    #[account(
        mut,
        seeds = [b"operator", authority.key().as_ref()],
        bump = operator.bump,
    )]
    pub operator: Account<'info, Operator>,
    
    pub authority: Signer<'info>,
}

// Events
#[event]
pub struct OperatorRegistered {
    pub wallet: Pubkey,
    pub handle: String,
    pub pda: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct XPUpdated {
    pub wallet: Pubkey,
    pub old_xp: u64,
    pub new_xp: u64,
    pub timestamp: i64,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Handle must be 3-20 characters")]
    InvalidHandleLength,
    
    #[msg("Handle can only contain letters, numbers, and underscores")]
    InvalidHandleFormat,
    
    #[msg("Must provide 1-5 skills")]
    InvalidSkillsCount,
    
    #[msg("Operator already registered")]
    AlreadyRegistered,
    
    #[msg("Unauthorized - not the operator owner")]
    Unauthorized,
}
```

#### Testing

```bash
# Build program
anchor build

# Run tests
anchor test

# Test duplicate handle registration
# Should fail with "already in use" error
```

---

### 3. Input Validation Layer

**Status:** 🟡 PARTIAL - Zod on client/server, missing in Anchor  
**Priority:** P0 - Must complete before mainnet  
**Estimated Time:** 2 hours

#### Three-Layer Validation

```typescript
// Layer 1: Client-side (Zod) - for UX
import { z } from 'zod';

export const HandleSchema = z.string()
  .min(3, 'Handle must be at least 3 characters')
  .max(20, 'Handle must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores');

export const SkillsSchema = z.array(z.string())
  .min(1, 'Must select at least 1 skill')
  .max(5, 'Can select at most 5 skills');

export const RegisterOperatorSchema = z.object({
  handle: HandleSchema,
  skills: SkillsSchema,
});

// Layer 2: Server-side (tRPC) - for security
import { TRPCError } from '@trpc/server';

export const operatorRouter = router({
  register: protectedProcedure
    .input(RegisterOperatorSchema)  // Zod validates automatically
    .mutation(async ({ input, ctx }) => {
      // Additional server-side checks
      const handleExists = await checkHandleAvailability(input.handle);
      if (handleExists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Handle already taken',
        });
      }
      
      // Proceed with registration
      return await createOperatorOnChain(ctx.wallet, input);
    }),
});

// Layer 3: On-chain (Anchor) - for immutability
// See Anchor program above with require! macros
```

---

### 4. Firebase Admin SDK Security

**Status:** 🟡 NEEDS IMPROVEMENT  
**Priority:** P0 - Security best practice  
**Estimated Time:** 1 hour

#### Secure Key Management

```bash
# .gitignore (CRITICAL)
serviceAccountKey.json
.env
.env.local
.env*.local
firebase-debug.log
*.log

# Never commit Firebase service account keys!
```

#### Environment Variables

```bash
# .env.example (commit this)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Actual .env (NEVER commit)
FIREBASE_PROJECT_ID=operator-network-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@operator-network.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

#### Initialize Firebase Admin

```typescript
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize only once
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const db = getFirestore();
```

#### Production Deployment

```bash
# For Vercel
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY

# For other platforms, use their secrets management:
# - AWS: Secrets Manager
# - Google Cloud: Secret Manager
# - Azure: Key Vault
```

---

## 🟡 High Priority Security (Week 1-2)

### 5. Rate Limiting

**Status:** 🔴 NOT IMPLEMENTED  
**Priority:** P1 - Important for production  
**Estimated Time:** 4 hours

#### Implementation with Upstash

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 10 requests per minute
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Different limits for different operations
export const strictRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 per minute for registration
});
```

#### tRPC Middleware

```typescript
import { TRPCError } from '@trpc/server';
import { ratelimit, strictRatelimit } from '@/lib/rate-limit';

// Rate limit middleware
const rateLimitMiddleware = (limit: typeof ratelimit) => 
  t.middleware(async ({ ctx, next, path }) => {
    const identifier = ctx.wallet?.publicKey?.toString() || ctx.ip || 'anonymous';
    
    const { success, limit: maxRequests, remaining, reset } = await limit.limit(
      `${path}:${identifier}`
    );
    
    if (!success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)}s`,
      });
    }
    
    return next();
  });

// Apply to endpoints
export const operatorRouter = router({
  register: protectedProcedure
    .use(rateLimitMiddleware(strictRatelimit))  // Strict limit
    .input(RegisterOperatorSchema)
    .mutation(async ({ input, ctx }) => {
      // Registration logic
    }),
    
  list: publicProcedure
    .use(rateLimitMiddleware(ratelimit))  // Normal limit
    .query(async () => {
      // List operators
    }),
});
```

#### Environment Setup

```bash
# Get free Redis from Upstash: https://upstash.com
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

---

### 6. Transaction Simulation

**Status:** 🔴 NOT IMPLEMENTED  
**Priority:** P1 - Important for UX and security  
**Estimated Time:** 2 hours

#### Implementation

```typescript
import { Transaction, Connection, PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';

/**
 * Safely execute a Solana transaction with simulation and balance checks
 * 
 * @param connection - Solana connection
 * @param transaction - Transaction to execute
 * @param wallet - User's wallet
 * @returns Transaction signature and explorer URL
 */
export async function safeExecuteTransaction(
  connection: Connection,
  transaction: Transaction,
  wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> }
) {
  // 1. Check balance
  const balance = await connection.getBalance(wallet.publicKey);
  const estimatedFee = 5000; // lamports
  
  if (balance < estimatedFee) {
    throw new Error(
      `Insufficient SOL balance. Need at least ◎${(estimatedFee / 1e9).toFixed(6)} for fees. ` +
      `Current balance: ◎${(balance / 1e9).toFixed(6)}`
    );
  }
  
  // 2. Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  
  // 3. Simulate transaction
  const { value: simulation } = await connection.simulateTransaction(transaction);
  
  if (simulation.err) {
    console.error('Simulation error:', simulation.err);
    throw new Error(
      `Transaction will fail: ${JSON.stringify(simulation.err)}\n` +
      `Logs: ${simulation.logs?.join('\n')}`
    );
  }
  
  // 4. Sign transaction
  const signedTx = await wallet.signTransaction(transaction);
  
  // 5. Send transaction
  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false, // Run simulation on-chain too
    maxRetries: 3,
  });
  
  // 6. Confirm transaction
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  }, 'confirmed');
  
  return {
    signature,
    explorerUrl: `https://solscan.io/tx/${signature}`,
  };
}
```

#### Usage in Components

```typescript
// In your registration component
try {
  const tx = await program.methods
    .registerOperator(handle, skills)
    .accounts({
      // accounts
    })
    .transaction();
  
  const { signature, explorerUrl } = await safeExecuteTransaction(
    connection,
    tx,
    wallet
  );
  
  toast.success(
    <div>
      Registration successful!
      <a href={explorerUrl} target="_blank">View on Solscan</a>
    </div>
  );
} catch (error) {
  if (error.message.includes('Insufficient SOL')) {
    toast.error('You need more SOL to register. Get some from a faucet or exchange.');
  } else {
    toast.error(`Registration failed: ${error.message}`);
  }
}
```

---

### 7. Helius Webhooks for Real-Time Sync

**Status:** 🔴 NOT IMPLEMENTED  
**Priority:** P1 - Important for data integrity  
**Estimated Time:** 6 hours

#### Setup Helius Webhook

```typescript
// scripts/setup-webhook.ts
import { Helius } from 'helius-sdk';

const helius = new Helius(process.env.HELIUS_API_KEY);

async function setupWebhook() {
  const webhook = await helius.createWebhook({
    webhookURL: 'https://your-app.com/api/webhooks/solana',
    transactionTypes: ['ANY'],
    accountAddresses: [process.env.PROGRAM_ID],
    webhookType: 'enhanced',
  });
  
  console.log('Webhook created:', webhook);
}

setupWebhook();
```

#### Webhook Handler

```typescript
// app/api/webhooks/solana/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  const db = getFirestore();
  
  // Verify webhook signature
  const signature = request.headers.get('x-helius-signature');
  if (!verifyHeliusSignature(signature, await request.text())) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const events = await request.json();
  
  for (const event of events) {
    try {
      // Parse event type
      if (event.type === 'OPERATOR_REGISTERED') {
        await handleOperatorRegistered(db, event);
      } else if (event.type === 'XP_UPDATED') {
        await handleXPUpdated(db, event);
      }
    } catch (error) {
      console.error('Error processing event:', error);
      // Don't throw - acknowledge receipt but log error
    }
  }
  
  return NextResponse.json({ success: true });
}

async function handleOperatorRegistered(db: FirebaseFirestore.Firestore, event: any) {
  const walletAddress = event.accounts.signer.toString();
  const pdaAddress = event.accounts.operator.toString();
  
  await db.collection('operators').doc(walletAddress).set({
    walletAddress,
    pdaAddress,
    handle: event.data.handle,
    xp: 0,
    skills: event.data.skills,
    active: true,
    lastSyncedSlot: event.slot,
    createdAt: new Date(event.timestamp * 1000),
    updatedAt: new Date(event.timestamp * 1000),
  });
  
  // Also claim handle
  await db.collection('handles').doc(event.data.handle).set({
    walletAddress,
    claimedAt: new Date(event.timestamp * 1000),
  });
}

async function handleXPUpdated(db: FirebaseFirestore.Firestore, event: any) {
  const walletAddress = event.accounts.authority.toString();
  
  await db.collection('operators').doc(walletAddress).update({
    xp: event.data.newXp,
    lastSyncedSlot: event.slot,
    updatedAt: new Date(event.timestamp * 1000),
  });
}

function verifyHeliusSignature(signature: string, body: string): boolean {
  // Implement HMAC verification with your webhook secret
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.HELIUS_WEBHOOK_SECRET);
  hmac.update(body);
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}
```

---

## 🟢 Post-MVP Security Enhancements

### 8. Integrity Verification Cron

**Priority:** P2 - Nice to have  
**Estimated Time:** 4 hours

```typescript
// functions/src/verify-integrity.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';

export const verifyOperatorIntegrity = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .pubsub.schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    
    const operatorsSnapshot = await db.collection('operators').get();
    const discrepancies: any[] = [];
    
    for (const doc of operatorsSnapshot.docs) {
      const profile = doc.data();
      
      try {
        // Derive PDA
        const [operatorPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('operator'), new PublicKey(profile.walletAddress).toBuffer()],
          new PublicKey(process.env.PROGRAM_ID)
        );
        
        // Fetch on-chain data
        const accountInfo = await connection.getAccountInfo(operatorPda);
        if (!accountInfo) {
          discrepancies.push({
            wallet: profile.walletAddress,
            issue: 'PDA does not exist on-chain',
          });
          continue;
        }
        
        // Decode and compare
        const onChainData = program.coder.accounts.decode('operator', accountInfo.data);
        
        if (onChainData.xp.toNumber() !== profile.xp) {
          discrepancies.push({
            wallet: profile.walletAddress,
            field: 'xp',
            expected: onChainData.xp.toNumber(),
            actual: profile.xp,
          });
        }
        
        if (onChainData.handle !== profile.handle) {
          discrepancies.push({
            wallet: profile.walletAddress,
            field: 'handle',
            expected: onChainData.handle,
            actual: profile.handle,
          });
        }
      } catch (error) {
        console.error(`Error verifying ${profile.walletAddress}:`, error);
      }
    }
    
    if (discrepancies.length > 0) {
      // Send alert to ops team
      console.error('DATA INTEGRITY ISSUES:', discrepancies);
      
      // Log to monitoring service (Sentry, etc.)
      // await sendAlert('Data integrity issues detected', discrepancies);
    }
    
    return { checked: operatorsSnapshot.size, discrepancies: discrepancies.length };
  });
```

---

### 9. Firebase App Check

**Priority:** P2 - Additional protection  
**Estimated Time:** 2 hours

```bash
# Enable App Check in Firebase Console
# Then install
npm install firebase/app-check
```

```typescript
// lib/firebase.ts (client-side)
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const app = initializeApp(firebaseConfig);

// Enable App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});
```

---

### 10. Multi-Sig for Program Upgrades

**Priority:** P2 - Governance security  
**Estimated Time:** 4 hours

```bash
# Use Squads Protocol
npm install @sqds/mesh
```

```typescript
// Create 2-of-3 multisig for program authority
import * as multisig from "@sqds/mesh";

const createMultisig = await multisig.rpc.multisigCreate({
  connection,
  createKey: multisigPda,
  creator: creator,
  multisigPda,
  configAuthority: null,
  timeLock: 0,
  members: [{
    key: member1.publicKey,
    permissions: multisig.types.Permissions.all(),
  }, {
    key: member2.publicKey,
    permissions: multisig.types.Permissions.all(),
  }, {
    key: member3.publicKey,
    permissions: multisig.types.Permissions.all(),
  }],
  threshold: 2, // 2-of-3
});
```

---

## 🔍 Security Testing Checklist

### Before Launch

- [ ] Firebase Security Rules deployed and tested
- [ ] Handle uniqueness enforced on-chain
- [ ] Input validation in all layers
- [ ] Firebase Admin SDK keys secured
- [ ] Rate limiting implemented
- [ ] Transaction simulation working
- [ ] Helius webhooks configured
- [ ] Error messages don't leak sensitive info
- [ ] All dependencies audited (`npm audit`)
- [ ] Firestore indexes created
- [ ] Test on devnet thoroughly

### Post-Launch Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Monitor rate limit hits
- [ ] Track failed transactions
- [ ] Alert on sync discrepancies
- [ ] Regular security audits
- [ ] Dependency updates (weekly)
- [ ] Penetration testing (quarterly)

---

## 🚨 Incident Response Plan

### If Security Issue Discovered

1. **Immediate Response**
   - Assess severity (P0 = Critical, P1 = High, P2 = Medium)
   - If P0: Consider emergency pause if available
   - Document the issue privately

2. **Containment**
   - Deploy hotfix if possible
   - Rate limit affected endpoints
   - Notify affected users if data breach

3. **Resolution**
   - Fix the vulnerability
   - Test thoroughly on devnet
   - Deploy to production
   - Monitor for 48 hours

4. **Post-Mortem**
   - Document root cause
   - Update security procedures
   - Add regression tests
   - Communicate transparently to community

---

## 📞 Security Contacts

**Security Team:** security@operatornetwork.xyz  
**Emergency:** [Discord Admin Channel]  
**Bug Bounty:** [To be announced]

**Responsible Disclosure:**
- Email security@operatornetwork.xyz
- PGP key: [To be provided]
- Expected response time: 24 hours

---

## 📊 Security Scorecard

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| Authentication | 8/10 | 9/10 | 🟡 Good |
| Authorization | 4/10 | 9/10 | 🔴 Critical |
| Input Validation | 6/10 | 9/10 | 🟡 Needs work |
| Data Integrity | 7/10 | 9/10 | 🟡 Good foundation |
| Rate Limiting | 3/10 | 9/10 | 🔴 Must implement |
| Key Management | 5/10 | 9/10 | 🟡 Needs improvement |
| Blockchain Security | 7/10 | 9/10 | 🟡 Good, needs validation |
| **Overall** | **6/10** | **9/10** | **🟡 60% Ready** |

---

## 🎯 Security Roadmap

### Week 1 (Critical - Blocking Launch)
- [ ] Day 1-2: Implement Firebase Security Rules
- [ ] Day 2-3: Add on-chain handle uniqueness
- [ ] Day 3-4: Complete input validation
- [ ] Day 4-5: Secure Firebase keys

### Week 2 (High Priority)
- [ ] Day 1-2: Implement rate limiting
- [ ] Day 2-3: Add transaction simulation
- [ ] Day 3-5: Set up Helius webhooks

### Week 3-4 (Post-MVP)
- [ ] Integrity verification cron
- [ ] Firebase App Check
- [ ] Multi-sig setup
- [ ] Security audit

---

**Last Updated:** 2025-10-06  
**Next Review:** Before mainnet launch  
**Owner:** Security Team

**Remember: Security is not a feature, it's a foundation. Every line of code is a security decision.**