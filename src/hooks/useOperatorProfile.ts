import { useState, useEffect } from 'react';
import { OperatorProfile } from '../types/operator';

// Mock data storage - in production this would connect to Supabase
const MOCK_OPERATORS: Record<string, OperatorProfile> = {
  '5KxW...g8Qp': {
    id: 'op_demo',
    walletAddress: '5KxW8f2vYQQQGHwrQoXX2mY7N8tP9JkL3vR8dN2jH4g8Qp',
    handle: 'demo_operator',
    skills: ['Dev', 'Coordination'],
    xp: 750,
    rank: 'Journeyman',
    connectedMachines: 2,
    activeOps: 1,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-05'),
    lastActive: new Date(),
  }
};

export function useOperatorProfile(walletAddress?: string) {
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setProfile(null);
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const existingProfile = MOCK_OPERATORS[walletAddress];
      setProfile(existingProfile || null);
      setLoading(false);
    }, 1000);
  }, [walletAddress]);

  const createProfile = async (handle: string, skills: string[]) => {
    if (!walletAddress) throw new Error('Wallet not connected');

    // Check handle uniqueness
    const existingHandles = Object.values(MOCK_OPERATORS).map(p => p.handle);
    if (existingHandles.includes(handle)) {
      throw new Error('Handle already taken');
    }

    const newProfile: OperatorProfile = {
      id: `op_${Date.now()}`,
      walletAddress,
      handle,
      skills: skills as any,
      xp: 0,
      rank: 'Apprentice',
      connectedMachines: 0,
      activeOps: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date(),
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    MOCK_OPERATORS[walletAddress] = newProfile;
    setProfile(newProfile);

    return newProfile;
  };

  return {
    profile,
    loading,
    createProfile,
  };
}