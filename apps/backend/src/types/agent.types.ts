export interface ParsedRules {
  action: 'dca' | 'buy' | 'sell' | 'monitor';
  asset: string;
  amount: number;
  interval: 'hourly' | 'daily' | 'weekly';
  stopLoss?: number;
  takeProfit?: number;
  priceDropPct?: number;
  condition?: string;
}

export interface AgentLog {
  blobId: string;
  timestamp: string;
  action: string;
  status: string;
  message?: any;
}

export interface Agent {
  id: string;
  intent: string;
  dailyLimit: number;
  walletAddress: string;
  agentWalletAddress?: string;
  agentPrivateKey?: string;
  strategyBlobId?: string;
  logBlobId?: string;
  rulesBlobId?: string;
  parsedRules?: ParsedRules;
  parentBlobIds?: string[];
  paused: boolean;
  spentToday: number;
  lastRun?: string | null;
  createdAt: string;
  logs: AgentLog[];
}

export interface TatumNodeStatus {
  online: boolean;
  latencyMs: number;
  checkpoint: string;
  network: string;
}

export interface WalrusBlob {
  _meta: {
    type: string;
    agentId: string;
    app: string;
    version: string;
    timestamp: string;
    network: string;
  };
  [key: string]: any;
}
