export type MachineCategory =
  | 'Game'
  | 'Tool'
  | 'Product'
  | 'Service'
  | 'Content'
  | 'Infrastructure';

export type MachineStatus =
  | 'Active'
  | 'Development'
  | 'Maintenance'
  | 'Archived';

export interface Machine {
  id: string;
  name: string;
  description: string;
  category: MachineCategory;
  status: MachineStatus;
  operators: string[]; // Operator IDs
  maxOperators: number;
  earnings: {
    total: number;
    monthly: number;
    currency: string;
  };
  metrics: {
    users: number;
    revenue: number;
    uptime: number;
  };
  tags: string[];
  imageUrl?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MachineConnection {
  machineId: string;
  operatorId: string;
  role: 'Owner' | 'Contributor' | 'Operator';
  joinedAt: Date;
  contribution: string;
  sharePercentage: number;
}