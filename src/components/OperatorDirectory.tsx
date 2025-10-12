import React, { useState, useMemo, useEffect } from 'react';
import { OperatorProfile, SKILL_TAGS, SkillTag, OperatorRank } from '../types/operator';
import { getOperators } from '../lib/firebase/operators';
import { subscribeToOperators, RealtimeManager } from '../lib/firebase/realtime';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, EnhancedCard } from './ui/Card';
import { Button, InteractiveButton } from './ui/Button';
import { Badge, StatusBadge, SkillBadge } from './ui/Badge';
import { LoadingSpinner, FullPageLoading, CardLoading } from './ui/Loading';
import { AnimatedCounter } from './ui/AnimatedCounter';

/**
 * Props for the OperatorDirectory component
 * @interface OperatorDirectoryProps
 */
interface OperatorDirectoryProps {
  /** Callback to navigate back to the dashboard */
  onBack: () => void;
}

/**
 * Operator Directory Component
 *
 * A comprehensive directory for discovering and searching operators within
 * the network. Provides filtering by skills, sorting by various criteria,
 * and search functionality to help operators find collaborators.
 *
 * Features:
 * - Real-time search by operator handle
 * - Filter by skill specializations
 * - Sort by newest, alphabetical, or XP
 * - Responsive operator profile cards
 * - Live activity and connection data
 * - Clear filters functionality
 *
 * @component
 * @param {OperatorDirectoryProps} props - Component props
 * @returns {JSX.Element} The operator directory interface
 *
 * @example
 * ```tsx
 * <OperatorDirectory
 *   onBack={() => setView('dashboard')}
 * />
 * ```
 */
// Dummy operators data for demo
const DUMMY_OPERATORS: OperatorProfile[] = [
  {
    id: 'op_001',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    handle: 'cryptobuilder',
    skills: ['Dev', 'Design'],
    xp: 4200,
    rank: 'Architect',
    connectedMachines: 5,
    activeOps: 3,
    completionRate: 98,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_002',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    handle: 'vibemaster',
    skills: ['VibeOps', 'Narrative'],
    xp: 3500,
    rank: 'Senior',
    connectedMachines: 4,
    activeOps: 2,
    completionRate: 92,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: 'op_003',
    walletAddress: '0x567890abcdef1234567890abcdef1234567890ab',
    handle: 'defi_wizard',
    skills: ['Dev', 'BizOps'],
    xp: 5800,
    rank: 'Architect',
    connectedMachines: 8,
    activeOps: 5,
    completionRate: 99,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 'op_004',
    walletAddress: '0x90abcdef1234567890abcdef1234567890abcdef',
    handle: 'pixel_artist',
    skills: ['Design', 'Narrative'],
    xp: 2200,
    rank: 'Operator',
    connectedMachines: 3,
    activeOps: 1,
    completionRate: 88,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: 'op_005',
    walletAddress: '0xcdef1234567890abcdef1234567890abcdef1234',
    handle: 'coordination_pro',
    skills: ['Coordination', 'BizOps'],
    xp: 3800,
    rank: 'Senior',
    connectedMachines: 6,
    activeOps: 4,
    completionRate: 95,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_006',
    walletAddress: '0x34567890abcdef1234567890abcdef1234567890',
    handle: 'solidity_sage',
    skills: ['Dev'],
    xp: 6500,
    rank: 'Architect',
    connectedMachines: 10,
    activeOps: 6,
    completionRate: 100,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
  },
  {
    id: 'op_007',
    walletAddress: '0xef1234567890abcdef1234567890abcdef123456',
    handle: 'community_lead',
    skills: ['VibeOps', 'Coordination', 'Narrative'],
    xp: 2900,
    rank: 'Senior',
    connectedMachines: 4,
    activeOps: 3,
    completionRate: 91,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: 'op_008',
    walletAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    handle: 'rookie_dev',
    skills: ['Dev', 'Design'],
    xp: 500,
    rank: 'Apprentice',
    connectedMachines: 1,
    activeOps: 0,
    completionRate: 75,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  // Additional operators for pagination testing
  {
    id: 'op_009',
    walletAddress: '0x90123456781234567890abcdef12345678901236',
    handle: 'zenith',
    skills: ['Dev', 'Coordination'],
    xp: 2800,
    rank: 'Senior',
    connectedMachines: 7,
    activeOps: 3,
    completionRate: 91,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_010',
    walletAddress: '0xa0123456781234567890abcdef12345678901237',
    handle: 'aurora',
    skills: ['Design', 'Narrative', 'VibeOps'],
    xp: 1650,
    rank: 'Operator',
    connectedMachines: 3,
    activeOps: 1,
    completionRate: 84,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_011',
    walletAddress: '0xb0123456781234567890abcdef12345678901238',
    handle: 'cosmos',
    skills: ['Dev', 'BizOps', 'Coordination'],
    xp: 5200,
    rank: 'Architect',
    connectedMachines: 15,
    activeOps: 5,
    completionRate: 99,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_012',
    walletAddress: '0xc0123456781234567890abcdef12345678901239',
    handle: 'pulsar',
    skills: ['Design'],
    xp: 750,
    rank: 'Apprentice',
    connectedMachines: 1,
    activeOps: 0,
    completionRate: 72,
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_013',
    walletAddress: '0xd0123456781234567890abcdef1234567890123a',
    handle: 'nexus',
    skills: ['Dev', 'Design', 'Narrative'],
    xp: 3100,
    rank: 'Senior',
    connectedMachines: 9,
    activeOps: 2,
    completionRate: 93,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_014',
    walletAddress: '0xe0123456781234567890abcdef1234567890123b',
    handle: 'vortex',
    skills: ['Coordination', 'BizOps'],
    xp: 1400,
    rank: 'Operator',
    connectedMachines: 4,
    activeOps: 1,
    completionRate: 82,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_015',
    walletAddress: '0xf0123456781234567890abcdef1234567890123c',
    handle: 'stellar',
    skills: ['VibeOps', 'Design'],
    xp: 950,
    rank: 'Apprentice',
    connectedMachines: 2,
    activeOps: 1,
    completionRate: 76,
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_016',
    walletAddress: '0x00123456781234567890abcdef1234567890123d',
    handle: 'quasar',
    skills: ['Dev', 'Coordination', 'BizOps'],
    xp: 4100,
    rank: 'Architect',
    connectedMachines: 13,
    activeOps: 4,
    completionRate: 97,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_017',
    walletAddress: '0x10123456781234567890abcdef1234567890123e',
    handle: 'horizon',
    skills: ['Design', 'Narrative'],
    xp: 1950,
    rank: 'Operator',
    connectedMachines: 5,
    activeOps: 2,
    completionRate: 86,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_018',
    walletAddress: '0x20123456781234567890abcdef1234567890123f',
    handle: 'galaxy',
    skills: ['Dev', 'VibeOps'],
    xp: 2400,
    rank: 'Senior',
    connectedMachines: 6,
    activeOps: 2,
    completionRate: 89,
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_019',
    walletAddress: '0x30123456781234567890abcdef12345678901240',
    handle: 'orbit',
    skills: ['Coordination'],
    xp: 600,
    rank: 'Apprentice',
    connectedMachines: 1,
    activeOps: 0,
    completionRate: 70,
    createdAt: new Date('2024-03-28'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_020',
    walletAddress: '0x40123456781234567890abcdef12345678901241',
    handle: 'meteor',
    skills: ['Dev', 'Design', 'BizOps'],
    xp: 3500,
    rank: 'Senior',
    connectedMachines: 11,
    activeOps: 3,
    completionRate: 94,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_021',
    walletAddress: '0x50123456781234567890abcdef12345678901242',
    handle: 'comet',
    skills: ['Narrative', 'VibeOps'],
    xp: 1100,
    rank: 'Apprentice',
    connectedMachines: 2,
    activeOps: 1,
    completionRate: 77,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_022',
    walletAddress: '0x60123456781234567890abcdef12345678901243',
    handle: 'lunar',
    skills: ['Design', 'Coordination'],
    xp: 2250,
    rank: 'Operator',
    connectedMachines: 6,
    activeOps: 2,
    completionRate: 87,
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_023',
    walletAddress: '0x70123456781234567890abcdef12345678901244',
    handle: 'solar',
    skills: ['Dev', 'BizOps', 'VibeOps'],
    xp: 4800,
    rank: 'Architect',
    connectedMachines: 14,
    activeOps: 5,
    completionRate: 98,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_024',
    walletAddress: '0x80123456781234567890abcdef12345678901245',
    handle: 'astro',
    skills: ['Design'],
    xp: 850,
    rank: 'Apprentice',
    connectedMachines: 1,
    activeOps: 0,
    completionRate: 73,
    createdAt: new Date('2024-03-22'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_025',
    walletAddress: '0x90123456781234567890abcdef12345678901246',
    handle: 'cosmic',
    skills: ['Dev', 'Narrative', 'Coordination'],
    xp: 2900,
    rank: 'Senior',
    connectedMachines: 8,
    activeOps: 3,
    completionRate: 90,
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_026',
    walletAddress: '0xa0123456781234567890abcdef12345678901247',
    handle: 'photon',
    skills: ['BizOps', 'VibeOps'],
    xp: 1550,
    rank: 'Operator',
    connectedMachines: 3,
    activeOps: 1,
    completionRate: 83,
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_027',
    walletAddress: '0xb0123456781234567890abcdef12345678901248',
    handle: 'neutron',
    skills: ['Dev', 'Design'],
    xp: 3700,
    rank: 'Senior',
    connectedMachines: 10,
    activeOps: 4,
    completionRate: 96,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_028',
    walletAddress: '0xc0123456781234567890abcdef12345678901249',
    handle: 'proton',
    skills: ['Coordination', 'Narrative'],
    xp: 1000,
    rank: 'Apprentice',
    connectedMachines: 2,
    activeOps: 0,
    completionRate: 74,
    createdAt: new Date('2024-03-14'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_029',
    walletAddress: '0xd0123456781234567890abcdef1234567890124a',
    handle: 'electron',
    skills: ['Dev', 'BizOps'],
    xp: 2650,
    rank: 'Senior',
    connectedMachines: 7,
    activeOps: 2,
    completionRate: 88,
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_030',
    walletAddress: '0xe0123456781234567890abcdef1234567890124b',
    handle: 'atom',
    skills: ['Design', 'VibeOps', 'Coordination'],
    xp: 1750,
    rank: 'Operator',
    connectedMachines: 4,
    activeOps: 2,
    completionRate: 85,
    createdAt: new Date('2024-02-22'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_031',
    walletAddress: '0xf0123456781234567890abcdef1234567890124c',
    handle: 'particle',
    skills: ['Dev'],
    xp: 550,
    rank: 'Apprentice',
    connectedMachines: 1,
    activeOps: 0,
    completionRate: 71,
    createdAt: new Date('2024-03-26'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_032',
    walletAddress: '0x00123456781234567890abcdef1234567890124d',
    handle: 'fusion',
    skills: ['Dev', 'Design', 'BizOps', 'Coordination'],
    xp: 5500,
    rank: 'Architect',
    connectedMachines: 16,
    activeOps: 6,
    completionRate: 99,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_033',
    walletAddress: '0x10123456781234567890abcdef1234567890124e',
    handle: 'plasma',
    skills: ['Narrative', 'Design'],
    xp: 1450,
    rank: 'Operator',
    connectedMachines: 3,
    activeOps: 1,
    completionRate: 81,
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_034',
    walletAddress: '0x20123456781234567890abcdef1234567890124f',
    handle: 'energy',
    skills: ['Dev', 'VibeOps'],
    xp: 3300,
    rank: 'Senior',
    connectedMachines: 9,
    activeOps: 3,
    completionRate: 92,
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_035',
    walletAddress: '0x30123456781234567890abcdef12345678901250',
    handle: 'quantum_leap',
    skills: ['BizOps', 'Coordination'],
    xp: 2000,
    rank: 'Operator',
    connectedMachines: 5,
    activeOps: 2,
    completionRate: 86,
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_036',
    walletAddress: '0x40123456781234567890abcdef12345678901251',
    handle: 'warp',
    skills: ['Dev', 'Design', 'Narrative'],
    xp: 4200,
    rank: 'Architect',
    connectedMachines: 12,
    activeOps: 4,
    completionRate: 97,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_037',
    walletAddress: '0x50123456781234567890abcdef12345678901252',
    handle: 'flux',
    skills: ['VibeOps'],
    xp: 700,
    rank: 'Apprentice',
    connectedMachines: 1,
    activeOps: 0,
    completionRate: 69,
    createdAt: new Date('2024-03-30'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_038',
    walletAddress: '0x60123456781234567890abcdef12345678901253',
    handle: 'momentum',
    skills: ['Dev', 'Coordination', 'BizOps'],
    xp: 3600,
    rank: 'Senior',
    connectedMachines: 10,
    activeOps: 3,
    completionRate: 95,
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_039',
    walletAddress: '0x70123456781234567890abcdef12345678901254',
    handle: 'velocity',
    skills: ['Design', 'Narrative'],
    xp: 1350,
    rank: 'Operator',
    connectedMachines: 3,
    activeOps: 1,
    completionRate: 79,
    createdAt: new Date('2024-03-02'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_040',
    walletAddress: '0x80123456781234567890abcdef12345678901255',
    handle: 'dimension',
    skills: ['Dev', 'Design', 'VibeOps', 'Coordination'],
    xp: 6000,
    rank: 'Architect',
    connectedMachines: 18,
    activeOps: 7,
    completionRate: 100,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    lastActive: new Date(),
  }
];

export default function OperatorDirectory({ onBack }: OperatorDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<SkillTag | 'all'>('all');
  const [completionRateFilter, setCompletionRateFilter] = useState<'all' | '90+' | '80+' | '70+'>('all');
  const [xpFilter, setXpFilter] = useState<'all' | '5000+' | '3000+' | '1000+'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'alphabetical' | 'xp' | 'completion' | 'machines' | 'active'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [operators, setOperators] = useState<OperatorProfile[]>([]);
  const [realtimeManager] = useState(() => new RealtimeManager());
  const [useDummyData, setUseDummyData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Set up real-time listeners for operators
  useEffect(() => {
    setIsLoading(true);
    setNetworkError(null);

    // Use dummy data for demo
    const useMockData = true; // Set to true to always use dummy data

    if (useMockData) {
      // Apply filters and sorting to dummy data
      setTimeout(() => {
        let filteredOps = [...DUMMY_OPERATORS];

        // Filter by skill
        if (selectedSkill !== 'all') {
          filteredOps = filteredOps.filter(op => op.skills.includes(selectedSkill));
        }

        // Filter by completion rate
        if (completionRateFilter !== 'all') {
          const minRate = parseInt(completionRateFilter.replace('+', ''));
          filteredOps = filteredOps.filter(op => (op.completionRate || 0) >= minRate);
        }

        // Filter by XP
        if (xpFilter !== 'all') {
          const minXP = parseInt(xpFilter.replace('+', ''));
          filteredOps = filteredOps.filter(op => op.xp >= minXP);
        }

        // Search filter
        if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredOps = filteredOps.filter(op =>
            op.handle.toLowerCase().includes(query)
          );
        }

        // Sorting
        if (sortBy === 'alphabetical') {
          filteredOps.sort((a, b) => a.handle.localeCompare(b.handle));
        } else if (sortBy === 'xp') {
          filteredOps.sort((a, b) => b.xp - a.xp);
        } else if (sortBy === 'newest') {
          filteredOps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } else if (sortBy === 'completion') {
          filteredOps.sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0));
        } else if (sortBy === 'machines') {
          filteredOps.sort((a, b) => b.connectedMachines - a.connectedMachines);
        } else if (sortBy === 'active') {
          filteredOps.sort((a, b) => b.activeOps - a.activeOps);
        }

        setOperators(filteredOps);
        setIsLoading(false);
      }, 500); // Simulate loading

      return;
    }

    // Clean up previous listeners
    realtimeManager.cleanup();

    // Subscribe to real-time operators
    const unsubscribe = subscribeToOperators(
      {
        skillFilter: selectedSkill === 'all' ? undefined : selectedSkill,
        limitCount: 50
      },
      (operators, error) => {
        if (error) {
          // Fall back to dummy data on error
          setUseDummyData(true);
          let filteredOps = [...DUMMY_OPERATORS];

          // Apply filters to dummy data
          if (selectedSkill !== 'all') {
            filteredOps = filteredOps.filter(op => op.skills.includes(selectedSkill));
          }
          if (completionRateFilter !== 'all') {
            const minRate = parseInt(completionRateFilter.replace('+', ''));
            filteredOps = filteredOps.filter(op => (op.completionRate || 0) >= minRate);
          }
          if (xpFilter !== 'all') {
            const minXP = parseInt(xpFilter.replace('+', ''));
            filteredOps = filteredOps.filter(op => op.xp >= minXP);
          }
          if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            filteredOps = filteredOps.filter(op =>
              op.handle.toLowerCase().includes(query)
            );
          }

          setOperators(filteredOps);
          setIsLoading(false);
          return;
        }

        // Apply client-side search filter and sorting
        let filteredOps = operators;

        // Search filter
        if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredOps = operators.filter(op =>
            op.handle.toLowerCase().includes(query)
          );
        }

        // Client-side sorting for specific sort options
        if (sortBy === 'alphabetical') {
          filteredOps.sort((a, b) => a.handle.localeCompare(b.handle));
        } else if (sortBy === 'xp') {
          filteredOps.sort((a, b) => b.xp - a.xp);
        } else if (sortBy === 'completion') {
          filteredOps.sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0));
        } else if (sortBy === 'machines') {
          filteredOps.sort((a, b) => b.connectedMachines - a.connectedMachines);
        } else if (sortBy === 'active') {
          filteredOps.sort((a, b) => b.activeOps - a.activeOps);
        }
        // 'newest' sorting is handled by Firebase query (lastActive desc)

        setOperators(filteredOps);
        setIsLoading(false);
      }
    );

    realtimeManager.addListener(unsubscribe);

    // Cleanup on unmount
    return () => {
      realtimeManager.cleanup();
    };
  }, [selectedSkill, completionRateFilter, xpFilter, debouncedSearchQuery, sortBy]);

  // Firebase already handles filtering and sorting
  const filteredOperators = operators;

  // Pagination logic
  const totalPages = Math.ceil(filteredOperators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOperators = filteredOperators.slice(startIndex, endIndex);

  // Reset to page 1 when filters or items per page change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedSkill, completionRateFilter, xpFilter, debouncedSearchQuery, sortBy, itemsPerPage]);

  // Show loading state
  if (isLoading) {
    return (
      <FullPageLoading
        title="Loading Operator Directory..."
        description="Discovering network operators"
        variant="spinner"
        size="lg"
      />
    );
  }

  // Show error state
  if (networkError) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="operator-card rounded-lg p-8 text-center space-y-4">
          <div className="w-8 h-8 text-red-500 mx-auto">⚠️</div>
          <div className="text-white">Failed to Load Directory</div>
          <div className="text-sm text-red-400">{networkError}</div>
          <button
            onClick={async () => {
              try {
                setNetworkError(null);
                setIsLoading(true);
                const result = await getOperators({
                  skillFilter: selectedSkill === 'all' ? undefined : selectedSkill,
                  rankFilter: selectedRank === 'all' ? undefined : selectedRank,
                  searchQuery: debouncedSearchQuery || undefined,
                  sortBy,
                  limitCount: 50
                });
                setOperators(result.operators);
                setIsLoading(false);
              } catch (error) {
                setNetworkError(error instanceof Error ? error.message : 'Failed to load operators');
                setIsLoading(false);
              }
            }}
            className="px-4 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen terminal-bg">
      {/* Header */}
      <div className="">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Operator Directory</h1>
            <p className="text-[var(--muted-foreground)]">Discover and connect with operators</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8 space-y-6">
        {/* Search and Filters */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Skill Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value as SkillTag | 'all')}
                className="w-full px-3 py-2 pr-10 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm appearance-none cursor-pointer hover:bg-[var(--muted)] transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.7rem center',
                  backgroundSize: '1.2em 1.2em',
                }}
              >
                <option value="all">All Skills</option>
                {SKILL_TAGS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Completion Rate Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Completion Rate</label>
              <select
                value={completionRateFilter}
                onChange={(e) => setCompletionRateFilter(e.target.value as 'all' | '90+' | '80+' | '70+')}
                className="w-full px-3 py-2 pr-10 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm appearance-none cursor-pointer hover:bg-[var(--muted)] transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.7rem center',
                  backgroundSize: '1.2em 1.2em',
                }}
              >
                <option value="all">All Rates</option>
                <option value="90+">90%+ completion</option>
                <option value="80+">80%+ completion</option>
                <option value="70+">70%+ completion</option>
              </select>
            </div>

            {/* XP Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Experience</label>
              <select
                value={xpFilter}
                onChange={(e) => setXpFilter(e.target.value as 'all' | '5000+' | '3000+' | '1000+')}
                className="w-full px-3 py-2 pr-10 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm appearance-none cursor-pointer hover:bg-[var(--muted)] transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.7rem center',
                  backgroundSize: '1.2em 1.2em',
                }}
              >
                <option value="all">All XP</option>
                <option value="5000+">5000+ XP</option>
                <option value="3000+">3000+ XP</option>
                <option value="1000+">1000+ XP</option>
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'alphabetical' | 'xp' | 'completion' | 'machines' | 'active')}
                className="w-full px-3 py-2 pr-10 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm appearance-none cursor-pointer hover:bg-[var(--muted)] transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.7rem center',
                  backgroundSize: '1.2em 1.2em',
                }}
              >
                <option value="newest">Newest First</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="xp">Highest XP</option>
                <option value="completion">Highest Completion</option>
                <option value="machines">Most Machines</option>
                <option value="active">Most Active Ops</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count and Items Per Page */}
        <div className="flex items-center justify-between">
          <div className="text-[var(--muted-foreground)] text-sm flex items-center gap-2">
            <AnimatedCounter value={filteredOperators.length} />
            <span>operator{filteredOperators.length !== 1 ? 's' : ''} found</span>
          </div>

          <div className="flex items-center gap-4">
            {filteredOperators.length > 10 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--muted-foreground)]">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 pr-8 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm appearance-none cursor-pointer hover:bg-[var(--muted)] transition-colors"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1em 1em',
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="100">100</option>
                </select>
                <span className="text-[var(--muted-foreground)]">per page</span>
              </div>
            )}

          </div>
        </div>

        {/* Operator Grid */}
        {filteredOperators.length === 0 ? (
          <EnhancedCard variant="clean" className="p-12 text-center space-y-4">
            <div className="text-[var(--color-text-muted)]">No operators found with these criteria</div>
            <InteractiveButton
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedSkill('all');
                setCompletionRateFilter('all');
                setXpFilter('all');
              }}
            >
              Clear Filters
            </InteractiveButton>
          </EnhancedCard>
        ) : (
          <div className="space-y-2">
            {paginatedOperators.map((operator, index) => (
              <div
                key={operator.id}
                className="flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:border-[var(--foreground)]/20 transition-all duration-200"
              >
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
                    <span className="text-sm font-medium text-[var(--muted-foreground)]">
                      {operator.handle.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Operator Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[var(--foreground)]">
                      {operator.handle}
                    </h3>
                    <span className="text-xs text-[var(--color-primary)]/70 bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {operator.xp} XP
                    </span>
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {operator.skills.join(' · ')}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-xs">
                  <div className="text-[var(--muted-foreground)]">
                    <span className="text-[var(--foreground)]">{operator.completionRate || 95}%</span>
                    <span className="ml-1">completion</span>
                  </div>
                  <div className="text-[var(--muted-foreground)]">
                    <span className="text-[var(--foreground)]">{operator.connectedMachines}</span>
                    <span className="ml-1">machines</span>
                  </div>
                  <div className="text-[var(--muted-foreground)]">
                    <span className="text-[var(--foreground)]">{operator.activeOps}</span>
                    <span className="ml-1">ops</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  <button
                    className="px-3 py-1.5 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors duration-200"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Section with Pagination and Count */}
        <div className="flex items-center justify-between mt-8">
          {/* Pagination Controls - Left/Center */}
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 text-sm rounded border transition-all duration-200 ${
                currentPage === 1
                  ? 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] cursor-not-allowed opacity-50'
                  : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
              }`}
            >
              ←
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {/* Always show first page */}
              <button
                onClick={() => setCurrentPage(1)}
                className={`px-3 py-1.5 text-sm rounded border transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                    : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
                }`}
              >
                1
              </button>

              {/* Show ellipsis if needed */}
              {currentPage > 3 && totalPages > 5 && (
                <span className="px-2 text-[var(--muted-foreground)]">...</span>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (page === 1 || page === totalPages) return false;
                  if (totalPages <= 5) return true;
                  return Math.abs(page - currentPage) <= 1;
                })
                .map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-sm rounded border transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                        : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {page}
                  </button>
                ))}

              {/* Show ellipsis if needed */}
              {currentPage < totalPages - 2 && totalPages > 5 && (
                <span className="px-2 text-[var(--muted-foreground)]">...</span>
              )}

              {/* Always show last page if more than 1 page */}
              {totalPages > 1 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1.5 text-sm rounded border transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                      : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
                  }`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 text-sm rounded border transition-all duration-200 ${
                currentPage === totalPages
                  ? 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] cursor-not-allowed opacity-50'
                  : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
              }`}
            >
              →
            </button>
            </div>
          ) : (
            <div></div>
          )}

          {/* Showing count - Right */}
          {filteredOperators.length > 0 && (
            <span className="text-xs text-[var(--muted-foreground)]">
              Showing {Math.min(startIndex + 1, filteredOperators.length)}-{Math.min(endIndex, filteredOperators.length)} of {filteredOperators.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}