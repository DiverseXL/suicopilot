import axios from 'axios';
import { publishAgentBlob, fetchBlob } from './walrus.service';
import { agents } from './scheduler.service';
import { saveAgent } from './db.service';

const INDEX_BLOB_FILE = 'data/index-blob-id.txt';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

// Save the index blob ID locally so we can find it on restart
function saveIndexBlobId(blobId: string) {
  const filePath = path.join(__dirname, '../../', INDEX_BLOB_FILE);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, blobId);
}

function loadIndexBlobId(): string | null {
  const filePath = path.join(__dirname, '../../', INDEX_BLOB_FILE);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8').trim();
}

// Publish a master index of all agents to Walrus
export async function publishAgentIndex(): Promise<string> {
  const agentList = Object.values(agents).map(a => ({
    id: a.id,
    strategyBlobId: a.strategyBlobId,
    intent: a.intent,
    createdAt: a.createdAt,
    paused: a.paused,
  }));

  const blobId = await publishAgentBlob('index', 'global', {
    agents: agentList,
    totalAgents: agentList.length,
    updatedAt: new Date().toISOString(),
  });

  saveIndexBlobId(blobId);
  logger.info(`[Walrus] Index blob updated → ${blobId}`);
  return blobId;
}

// On startup — restore all agents from Walrus index
export async function restoreFromIndex(): Promise<void> {
  const indexBlobId = loadIndexBlobId();
  if (!indexBlobId) {
    logger.info('[Recovery] No index blob found, starting fresh');
    return;
  }

  try {
    logger.info(`[Recovery] Reading index from Walrus: ${indexBlobId}`);
    const index = await fetchBlob(indexBlobId);

    if (!index?.agents?.length) return;

    logger.info(`[Recovery] Found ${index.agents.length} agents in Walrus index`);

    for (const entry of index.agents) {
      if (agents[entry.id]) continue; // already in SQLite cache

      try {
        const strategy = await fetchBlob(entry.strategyBlobId);
        if (!strategy?.id) continue;

        const restored = {
          id: strategy.id,
          intent: strategy.intent,
          dailyLimit: strategy.dailyLimit,
          walletAddress: strategy.walletAddress,
          agentWalletAddress: strategy.agentWalletAddress ?? null,
          strategyBlobId: entry.strategyBlobId,
          logBlobId: null,
          paused: entry.paused ?? false,
          spentToday: 0,
          lastRun: null,
          createdAt: strategy.createdAt,
          logs: [],
          parsedRules: strategy.parsedRules ?? null,
        };

        agents[restored.id] = restored;
        saveAgent(restored);
        logger.info(`[Recovery] Restored agent ${restored.id} from Walrus`);
      } catch (e: any) {
        logger.error(`[Recovery] Failed for blob ${entry.strategyBlobId}:`, e.message);
      }
    }
  } catch (e: any) {
    logger.error('[Recovery] Index read failed:', e.message);
  }
}

export async function fetchBlobData(blobId: string): Promise<any> {
  return fetchBlob(blobId);
}

export async function recoverAgentsFromWalrus(blobIds: string[]): Promise<void> {
  if (!blobIds.length) return;
  logger.info(`[Recovery] Manual recovery of ${blobIds.length} blobs...`);
  for (const blobId of blobIds) {
    try {
      const data = await fetchBlob(blobId);
      if (!data?.id || !data?.intent) continue;
      if (agents[data.id]) continue;
      const restored = {
        id: data.id,
        intent: data.intent,
        dailyLimit: data.dailyLimit,
        walletAddress: data.walletAddress,
        agentWalletAddress: data.agentWalletAddress ?? null,
        strategyBlobId: blobId,
        logBlobId: null,
        paused: false,
        spentToday: 0,
        lastRun: null,
        createdAt: data.createdAt ?? new Date().toISOString(),
        logs: [],
        parsedRules: data.parsedRules ?? null,
      };
      agents[restored.id] = restored;
      saveAgent(restored);
      logger.info(`[Recovery] Restored ${restored.id}`);
    } catch (e: any) {
      logger.error(`[Recovery] Failed ${blobId}:`, e.message);
    }
  }
}
