
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; // Optional field for generated images in chat
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  status: 'Lead' | 'Onboarding' | 'Contracted' | 'Active';
  supplyVolume: number; // e.g., units per month
  lockInScore: number; // 0-100
}

export interface Buyer {
  id: string;
  name: string;
  qualificationScore: number; // 0-100
  segment: 'Enterprise' | 'SME' | 'Direct';
  acquisitionStatus: 'Target' | 'Contacted' | 'Qualified' | 'First Trade';
}

export interface TransactionMetric {
  date: string;
  transactions: number;
  supplyActive: number;
  demandActive: number;
}

export interface LiquidityInsight {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
}

export interface GeneratedAsset {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export type View = 'Landing' | 'Dashboard' | 'Supply' | 'Demand' | 'Playbooks' | 'AI-Lab' | 'Visuals' | 'About';
