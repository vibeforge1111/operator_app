export type SkillTag =
  | 'Dev'
  | 'Design'
  | 'VibeOps'
  | 'BizOps'
  | 'Narrative'
  | 'Coordination';

export interface OperatorProfile {
  id: string;
  walletAddress: string;
  handle: string;
  skills: SkillTag[];
  xp: number;
  rank: string;
  connectedMachines: number;
  activeOps: number;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  bio?: string;
}

export interface OperatorRegistration {
  handle: string;
  skills: SkillTag[];
}

export const SKILL_TAGS: SkillTag[] = [
  'Dev',
  'Design',
  'VibeOps',
  'BizOps',
  'Narrative',
  'Coordination'
];

export const SKILL_DESCRIPTIONS = {
  Dev: 'Engineering/Technical',
  Design: 'UI/UX/Visual',
  VibeOps: 'Community/Culture',
  BizOps: 'Strategy/Operations',
  Narrative: 'Content/Storytelling',
  Coordination: 'Project Management'
} as const;