/**
 * Zod validation schemas for the Operator Network
 *
 * All data validation must go through these schemas to ensure
 * security and type safety across the application.
 *
 * @fileoverview Core validation schemas using Zod
 */

import { z } from 'zod';

// =============================================================================
// SKILL TAXONOMY
// =============================================================================

/**
 * Valid skill tags for operators
 *
 * These are the only allowed skill categories in the MVP.
 * Adding new skills requires updating both this schema and
 * the Firebase Security Rules.
 */
export const SkillTagSchema = z.enum([
  'Dev',
  'Design',
  'VibeOps',
  'BizOps',
  'Narrative',
  'Coordination'
]);

export type SkillTag = z.infer<typeof SkillTagSchema>;

// =============================================================================
// OPERATOR SCHEMAS
// =============================================================================

/**
 * Operator handle validation
 *
 * Security requirements:
 * - 3-20 characters (prevents spam and abuse)
 * - Alphanumeric + underscore only (prevents injection)
 * - No leading/trailing whitespace
 *
 * @example "alice_dev", "bob123", "operator_1"
 */
export const HandleSchema = z.string()
  .min(3, 'Handle must be at least 3 characters')
  .max(20, 'Handle must be no more than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores')
  .transform(val => val.trim());

/**
 * Solana wallet address validation
 *
 * Validates base58 encoded public keys (32-44 characters)
 * Used for wallet addresses and PDA derivation
 */
export const WalletAddressSchema = z.string()
  .min(32, 'Wallet address too short')
  .max(44, 'Wallet address too long')
  .regex(/^[1-9A-HJ-NP-Za-km-z]+$/, 'Invalid base58 encoding');

/**
 * Operator registration payload
 *
 * Used when creating new operator profiles.
 * Skills array is limited to 1-5 items to prevent spam.
 */
export const OperatorRegistrationSchema = z.object({
  handle: HandleSchema,
  skills: z.array(SkillTagSchema)
    .min(1, 'Must select at least one skill')
    .max(5, 'Cannot select more than 5 skills'),
  walletAddress: WalletAddressSchema
});

export type OperatorRegistration = z.infer<typeof OperatorRegistrationSchema>;

/**
 * Complete operator profile schema
 *
 * Represents the full operator data structure.
 * Used for database validation and API responses.
 * Handles both Date objects and Firestore Timestamps.
 */
export const OperatorProfileSchema = z.object({
  id: z.string().min(1),
  walletAddress: WalletAddressSchema,
  handle: HandleSchema,
  skills: z.array(SkillTagSchema).min(1).max(5),
  xp: z.number().int().min(0).max(1000000),
  rank: z.enum(['Apprentice', 'Operator', 'Senior', 'Architect']),
  connectedMachines: z.number().int().min(0),
  activeOps: z.number().int().min(0),
  bio: z.string().max(500).optional(),
  // Handle Firestore Timestamps and Date objects
  createdAt: z.union([
    z.date(),
    z.object({ seconds: z.number(), nanoseconds: z.number() }),
    z.null()
  ]).transform(val => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === 'object' && 'seconds' in val) {
      return new Date(val.seconds * 1000);
    }
    return new Date();
  }),
  updatedAt: z.union([
    z.date(),
    z.object({ seconds: z.number(), nanoseconds: z.number() }),
    z.null()
  ]).transform(val => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === 'object' && 'seconds' in val) {
      return new Date(val.seconds * 1000);
    }
    return new Date();
  }),
  lastActive: z.union([
    z.date(),
    z.object({ seconds: z.number(), nanoseconds: z.number() }),
    z.null()
  ]).transform(val => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === 'object' && 'seconds' in val) {
      return new Date(val.seconds * 1000);
    }
    return new Date();
  })
});

export type OperatorProfile = z.infer<typeof OperatorProfileSchema>;

// =============================================================================
// MACHINE SCHEMAS
// =============================================================================

/**
 * Machine category validation
 *
 * Defines the types of Machines of Production available
 * in the network. Each category has different characteristics.
 */
export const MachineCategorySchema = z.enum([
  'Game',
  'Tool',
  'Product',
  'Service',
  'Content',
  'Infrastructure'
]);

export type MachineCategory = z.infer<typeof MachineCategorySchema>;

/**
 * Machine status validation
 *
 * Tracks the operational state of machines.
 * Only Active machines can accept new operators.
 */
export const MachineStatusSchema = z.enum([
  'Active',
  'Development',
  'Maintenance',
  'Archived'
]);

export type MachineStatus = z.infer<typeof MachineStatusSchema>;

/**
 * Machine metrics validation
 *
 * Financial and operational metrics for machines.
 * All numbers must be non-negative.
 */
export const MachineMetricsSchema = z.object({
  users: z.number().int().min(0),
  revenue: z.number().min(0),
  uptime: z.number().min(0).max(100)
});

/**
 * Machine earnings validation
 *
 * Revenue data for machines.
 * Currency must be valid token symbol.
 */
export const MachineEarningsSchema = z.object({
  total: z.number().min(0),
  monthly: z.number().min(0),
  currency: z.enum(['SOL', 'USDC', 'USD'])
});

/**
 * Complete machine schema
 *
 * Represents a Machine of Production in the network.
 * Used for marketplace listings and connections.
 * Handles both Date objects and Firestore Timestamps.
 */
export const MachineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: MachineCategorySchema,
  status: MachineStatusSchema,
  operators: z.array(z.string()).max(20), // Operator IDs
  maxOperators: z.number().int().min(1).max(20),
  earnings: MachineEarningsSchema,
  metrics: MachineMetricsSchema,
  tags: z.array(z.string()).max(10),
  imageUrl: z.string().url().optional(),
  repositoryUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  // Handle Firestore Timestamps and Date objects
  createdAt: z.union([
    z.date(),
    z.object({ seconds: z.number(), nanoseconds: z.number() }),
    z.null()
  ]).transform(val => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === 'object' && 'seconds' in val) {
      return new Date(val.seconds * 1000);
    }
    return new Date();
  }),
  updatedAt: z.union([
    z.date(),
    z.object({ seconds: z.number(), nanoseconds: z.number() }),
    z.null()
  ]).transform(val => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === 'object' && 'seconds' in val) {
      return new Date(val.seconds * 1000);
    }
    return new Date();
  })
});

export type Machine = z.infer<typeof MachineSchema>;

/**
 * Machine connection request
 *
 * Payload for connecting an operator to a machine.
 * Includes contribution description for transparency.
 */
export const MachineConnectionSchema = z.object({
  machineId: z.string().min(1),
  operatorId: z.string().min(1),
  role: z.enum(['Owner', 'Contributor', 'Operator']),
  contribution: z.string().min(10).max(500),
  sharePercentage: z.number().min(0).max(100)
});

export type MachineConnection = z.infer<typeof MachineConnectionSchema>;

// =============================================================================
// SEARCH & FILTERING SCHEMAS
// =============================================================================

/**
 * Operator directory search parameters
 *
 * Used for filtering and searching operators.
 * All parameters are optional for flexible querying.
 */
export const OperatorSearchSchema = z.object({
  query: z.string().max(100).optional(),
  skills: z.array(SkillTagSchema).optional(),
  minXp: z.number().int().min(0).optional(),
  maxXp: z.number().int().min(0).optional(),
  rank: z.array(z.enum(['Apprentice', 'Operator', 'Senior', 'Architect'])).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

export type OperatorSearch = z.infer<typeof OperatorSearchSchema>;

/**
 * Machine marketplace search parameters
 *
 * Used for filtering machines in the marketplace.
 * Supports category, status, and availability filtering.
 */
export const MachineSearchSchema = z.object({
  query: z.string().max(100).optional(),
  category: MachineCategorySchema.optional(),
  status: MachineStatusSchema.optional(),
  availableOnly: z.boolean().default(false),
  minRevenue: z.number().min(0).optional(),
  maxRevenue: z.number().min(0).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

export type MachineSearch = z.infer<typeof MachineSearchSchema>;

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/**
 * Standard API success response
 *
 * All successful API responses should follow this structure
 * for consistent error handling and data access.
 */
export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.date()
  });

/**
 * Standard API error response
 *
 * All API errors should follow this structure.
 * Includes error codes for programmatic handling.
 */
export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional()
  }),
  timestamp: z.date()
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// =============================================================================
// OPERATION SCHEMAS (Re-exported from operation types)
// =============================================================================

// Re-export operation schemas for centralized validation
export {
  OperationSchema,
  OperationStatusSchema,
  OperationPrioritySchema,
  OperationCategorySchema,
  OperationRewardSchema,
  type Operation,
  type OperationStatus,
  type OperationPriority,
  type OperationCategory,
  type OperationReward
} from '../../types/operation';

// =============================================================================
// PAGINATION SCHEMAS
// =============================================================================

/**
 * Paginated response wrapper
 *
 * Used for all paginated API endpoints.
 * Includes metadata for building pagination UI.
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      total: z.number().int().min(0),
      limit: z.number().int().min(1),
      offset: z.number().int().min(0),
      hasMore: z.boolean()
    })
  });

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validates operator handle uniqueness format
 *
 * This is a client-side check. Server must also verify
 * uniqueness against the database.
 *
 * @param handle - The handle to validate
 * @returns Validation result with error details
 */
export function validateHandle(handle: string) {
  try {
    HandleSchema.parse(handle);
    return { valid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid handle'
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Validates skill selection for operators
 *
 * Ensures skills are from the allowed taxonomy and
 * within the quantity limits.
 *
 * @param skills - Array of skill tags to validate
 * @returns Validation result with error details
 */
export function validateSkills(skills: string[]) {
  try {
    z.array(SkillTagSchema).min(1).max(5).parse(skills);
    return { valid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid skills'
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Validates Solana wallet address format
 *
 * Checks base58 encoding and length.
 * Does not verify if the address exists on-chain.
 *
 * @param address - Wallet address to validate
 * @returns Validation result with error details
 */
export function validateWalletAddress(address: string) {
  try {
    WalletAddressSchema.parse(address);
    return { valid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid wallet address'
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
}