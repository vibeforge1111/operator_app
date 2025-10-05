/**
 * Mock operation data for the Operator Network
 *
 * Provides sample operations/missions for the mission board system.
 * Used for demo and development purposes.
 *
 * @fileoverview Mock operations data
 */

import { Operation } from '../types/operation';

export const MOCK_OPERATIONS: Operation[] = [
  {
    id: 'op-001',
    title: 'Implement Mars Terrain Generator',
    description: `Build a procedural terrain generation system for the Mars Survival Game.

    Requirements:
    - Generate realistic Martian landscapes using Perlin noise
    - Include crater generation system
    - Optimize for mobile performance
    - Create documentation and unit tests

    This is a critical feature for the next game update and will be showcased to potential investors.`,
    category: 'Development',
    status: 'Open',
    priority: 'High',
    machineId: 'machine-001', // Mars Survival Game
    requiredSkills: ['Dev', 'Design'],
    reward: {
      xp: 500,
      tokens: 150,
      currency: 'SOL'
    },
    estimatedHours: 20,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ['phaser', 'webgl', 'procedural-generation', 'mobile'],
    difficulty: 'Advanced',
    repositoryUrl: 'https://github.com/vibeforge1111/mars-survival-terrain',
    docsUrl: 'https://docs.mars-survival.com/terrain',
    issueUrl: 'https://github.com/vibeforge1111/mars-survival/issues/42'
  },
  {
    id: 'op-002',
    title: 'Design NFT Collection Artwork',
    description: `Create visual assets for the Operator NFT Collection. Need 100 unique operator avatars with different skill specializations.

    Deliverables:
    - 100 unique character designs (2048x2048px)
    - Trait system with rarity distribution
    - Animation frames for special traits
    - Style guide documentation

    All artwork must follow the terminal aesthetic and green/purple color scheme.`,
    category: 'Design',
    status: 'Open',
    priority: 'Medium',
    machineId: 'machine-003', // Operator NFT Collection
    requiredSkills: ['Design', 'VibeOps'],
    reward: {
      xp: 300,
      tokens: 200,
      currency: 'USDC'
    },
    estimatedHours: 40,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tags: ['nft', 'character-design', 'pixel-art', 'traits'],
    difficulty: 'Intermediate',
    repositoryUrl: 'https://github.com/vibeforge1111/operator-nft-assets',
    docsUrl: 'https://docs.operator-network.app/nft-style-guide'
  },
  {
    id: 'op-003',
    title: 'Write AI Content Strategy',
    description: `Develop content strategy and initial prompts for the AI Content Generator tool.

    Scope:
    - Research competitor content strategies
    - Create 50 high-quality prompt templates
    - Write user onboarding documentation
    - Design content moderation guidelines

    The strategy should focus on helping creators build authentic personal brands while maintaining quality standards.`,
    category: 'Content',
    status: 'InProgress',
    priority: 'Medium',
    machineId: 'machine-002', // AI Content Generator
    assignedOperatorId: 'op-003', // alice_dev
    requiredSkills: ['Narrative', 'BizOps'],
    reward: {
      xp: 250,
      tokens: 100,
      currency: 'SOL'
    },
    estimatedHours: 15,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    tags: ['ai', 'content-strategy', 'documentation'],
    difficulty: 'Intermediate',
    docsUrl: 'https://docs.ai-content-gen.com/strategy'
  },
  {
    id: 'op-004',
    title: 'Fix Mobile Responsiveness',
    description: `Resolve mobile display issues across the Operator Network app.

    Issues to fix:
    - Dashboard cards overlapping on small screens
    - Machine marketplace filters not accessible on mobile
    - Operator directory search bar cutoff
    - Wallet connection modal too large for mobile

    Must test on iOS Safari, Android Chrome, and mobile Firefox. Include screenshots of fixes.`,
    category: 'Development',
    status: 'Open',
    priority: 'Critical',
    machineId: 'operator-app', // Main app
    requiredSkills: ['Dev', 'Design'],
    reward: {
      xp: 200,
      tokens: 75,
      currency: 'SOL'
    },
    estimatedHours: 8,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    tags: ['mobile', 'responsive', 'css', 'testing'],
    difficulty: 'Beginner',
    repositoryUrl: 'https://github.com/vibeforge1111/operator_app',
    issueUrl: 'https://github.com/vibeforge1111/operator_app/issues/15'
  },
  {
    id: 'op-005',
    title: 'Community Discord Bot',
    description: `Build a Discord bot to bridge the Operator Network with Discord communities.

    Features needed:
    - Operator profile verification
    - XP and rank display commands
    - Machine status announcements
    - Operation board integration
    - Wallet verification system

    Bot should use the same terminal aesthetic and integrate with the Firebase backend.`,
    category: 'Development',
    status: 'Open',
    priority: 'Low',
    machineId: 'machine-005', // Podcast Network
    requiredSkills: ['Dev', 'VibeOps'],
    reward: {
      xp: 400,
      tokens: 120,
      currency: 'SOL'
    },
    estimatedHours: 25,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    tags: ['discord', 'bot', 'community', 'api'],
    difficulty: 'Advanced',
    repositoryUrl: 'https://github.com/vibeforge1111/operator-discord-bot'
  },
  {
    id: 'op-006',
    title: 'Analytics Dashboard Testing',
    description: `Comprehensive testing of the new Analytics Dashboard before public launch.

    Testing areas:
    - Data visualization accuracy
    - Real-time update performance
    - Export functionality
    - User permission systems
    - API rate limiting

    Document all bugs with reproduction steps and priority levels. Create test cases for future regression testing.`,
    category: 'Testing',
    status: 'Open',
    priority: 'High',
    machineId: 'machine-006', // Analytics Dashboard
    requiredSkills: ['Dev', 'BizOps'],
    reward: {
      xp: 180,
      tokens: 60,
      currency: 'USDC'
    },
    estimatedHours: 12,
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tags: ['testing', 'qa', 'dashboard', 'analytics'],
    difficulty: 'Intermediate',
    docsUrl: 'https://docs.analytics-dashboard.com/testing-guide'
  },
  {
    id: 'op-007',
    title: 'Write Machine Onboarding Guide',
    description: `Create comprehensive documentation for machine owners joining the network.

    Content needed:
    - Getting started guide
    - Revenue sharing explanation
    - Operator management best practices
    - Technical integration steps
    - Legal and compliance guidelines

    Must be beginner-friendly while covering advanced topics. Include code examples and screenshots.`,
    category: 'Documentation',
    status: 'Open',
    priority: 'Medium',
    machineId: 'operator-network',
    requiredSkills: ['Narrative', 'BizOps'],
    reward: {
      xp: 220,
      tokens: 80,
      currency: 'SOL'
    },
    estimatedHours: 18,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ['documentation', 'onboarding', 'guide', 'technical-writing'],
    difficulty: 'Beginner',
    docsUrl: 'https://docs.operator-network.app/machine-onboarding'
  },
  {
    id: 'op-008',
    title: 'Research Competitor Analysis',
    description: `Conduct thorough analysis of competing decentralized work platforms and autonomous systems.

    Research scope:
    - Feature comparison matrix
    - Tokenomics analysis
    - User experience evaluation
    - Technical architecture review
    - Market positioning insights

    Deliver executive summary with strategic recommendations for differentiation and competitive advantages.`,
    category: 'Research',
    status: 'UnderReview',
    priority: 'Low',
    machineId: 'operator-network',
    assignedOperatorId: 'op-004', // coordinator_pro
    requiredSkills: ['BizOps', 'Narrative'],
    reward: {
      xp: 300,
      tokens: 100,
      currency: 'USD'
    },
    estimatedHours: 30,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    tags: ['research', 'competitive-analysis', 'strategy', 'market'],
    difficulty: 'Advanced'
  }
];

/**
 * Gets operations for a specific machine
 */
export function getOperationsByMachine(machineId: string): Operation[] {
  return MOCK_OPERATIONS.filter(op => op.machineId === machineId);
}

/**
 * Gets operations assigned to a specific operator
 */
export function getOperationsByOperator(operatorId: string): Operation[] {
  return MOCK_OPERATIONS.filter(op => op.assignedOperatorId === operatorId);
}

/**
 * Gets open operations that an operator can take
 */
export function getAvailableOperations(): Operation[] {
  return MOCK_OPERATIONS.filter(op => op.status === 'Open');
}