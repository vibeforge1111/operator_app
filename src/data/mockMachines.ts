import { Machine } from '../types/machine';

export const MOCK_MACHINES: Machine[] = [
  {
    id: 'machine_001',
    name: 'Mars Survival Game',
    description: 'Top-down survival game with oxygen management, resource gathering, and base building on Mars.',
    category: 'Game',
    status: 'Active',
    operators: ['op_1', 'op_4'], // alice_dev, dave_fullstack
    maxOperators: 5,
    earnings: {
      total: 12500,
      monthly: 2100,
      currency: 'SOL'
    },
    metrics: {
      users: 1250,
      revenue: 12500,
      uptime: 99.2
    },
    tags: ['Phaser', 'JavaScript', 'Gaming', 'Survival'],
    liveUrl: 'https://mars-survival.game',
    repositoryUrl: 'https://github.com/operator-network/mars-survival',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-05'),
  },
  {
    id: 'machine_002',
    name: 'AI Content Generator',
    description: 'Automated content creation tool for social media, blogs, and marketing materials using advanced AI.',
    category: 'Tool',
    status: 'Development',
    operators: ['op_2'], // bob_design
    maxOperators: 3,
    earnings: {
      total: 8200,
      monthly: 1600,
      currency: 'SOL'
    },
    metrics: {
      users: 850,
      revenue: 8200,
      uptime: 97.8
    },
    tags: ['AI', 'Content', 'Automation', 'Marketing'],
    liveUrl: 'https://ai-content-gen.app',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-10-03'),
  },
  {
    id: 'machine_003',
    name: 'Operator NFT Collection',
    description: 'Dynamic NFT collection representing operator achievements, skills, and network contributions.',
    category: 'Product',
    status: 'Active',
    operators: ['op_3'], // carol_ops
    maxOperators: 4,
    earnings: {
      total: 25000,
      monthly: 4200,
      currency: 'SOL'
    },
    metrics: {
      users: 3200,
      revenue: 25000,
      uptime: 99.9
    },
    tags: ['NFT', 'Solana', 'Art', 'Community'],
    liveUrl: 'https://operator-nfts.com',
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2024-10-04'),
  },
  {
    id: 'machine_004',
    name: 'Network Analytics Dashboard',
    description: 'Real-time analytics and monitoring tool for the Operator Network ecosystem.',
    category: 'Infrastructure',
    status: 'Development',
    operators: [], // Available to join
    maxOperators: 6,
    earnings: {
      total: 0,
      monthly: 0,
      currency: 'SOL'
    },
    metrics: {
      users: 0,
      revenue: 0,
      uptime: 95.0
    },
    tags: ['Analytics', 'Dashboard', 'Monitoring', 'Infrastructure'],
    repositoryUrl: 'https://github.com/operator-network/analytics',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: 'machine_005',
    name: 'Decentralized Design Studio',
    description: 'Collaborative design platform where operators can create, share, and monetize design assets.',
    category: 'Service',
    status: 'Active',
    operators: ['op_2', 'op_4'], // bob_design, dave_fullstack
    maxOperators: 8,
    earnings: {
      total: 15800,
      monthly: 2800,
      currency: 'SOL'
    },
    metrics: {
      users: 1850,
      revenue: 15800,
      uptime: 98.5
    },
    tags: ['Design', 'Collaboration', 'Marketplace', 'Creative'],
    liveUrl: 'https://design-studio.network',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-10-02'),
  },
  {
    id: 'machine_006',
    name: 'Operator Podcast Network',
    description: 'Decentralized podcast platform where operators share knowledge, stories, and network updates.',
    category: 'Content',
    status: 'Active',
    operators: ['op_3'], // carol_ops
    maxOperators: 10,
    earnings: {
      total: 6500,
      monthly: 1200,
      currency: 'SOL'
    },
    metrics: {
      users: 2100,
      revenue: 6500,
      uptime: 99.1
    },
    tags: ['Podcast', 'Content', 'Community', 'Education'],
    liveUrl: 'https://podcast.operator.network',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-09-30'),
  },
];