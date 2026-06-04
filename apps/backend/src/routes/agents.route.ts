import { Router, Request, Response } from 'express';
import { publishBlob, fetchBlob, publishAgentBlob } from '../services/walrus.service';
import { getSuiBalance, getSuiPrice, getTatumNodeStatus, getExchangeRate, checkMaliciousAddress, getAllBalances, getTransactionHistory, getLatencyHistory, getAverageLatency, rpcCall } from '../services/tatum.service';
import { agents } from '../services/scheduler.service';
import { v4 as uuidv4 } from 'uuid';
import { generateAgentWallet } from '../services/wallet.service';
import { executeSwap, executeDCASwap } from '../services/swap.service';
import { saveAgent, saveLog, loadAllAgents, getAgent } from '../services/db.service';
import { recoverAgentsFromWalrus, publishAgentIndex } from '../services/walrus-recovery.service';
import { parseIntent } from '../services/mcp.service';
import { broadcast } from '../realtime';
import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';
import { Agent } from '../types/agent.types';

const router = Router();

// Recover agents from Walrus blobs
router.post('/recover', async (req: Request, res: Response) => {
  try {
    const { blobIds } = req.body;
    if (!Array.isArray(blobIds) || blobIds.length === 0) {
      return res.status(400).json({ error: 'blobIds array required' });
    }
    await recoverAgentsFromWalrus(blobIds);
    await publishAgentIndex();
    res.json({
      success: true,
      message: `Recovery attempted for ${blobIds.length} blobs`,
      agentsInMemory: Object.keys(agents).length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new agent
router.post('/', async (req: Request, res: Response) => {
  try {
    logger.info('Deploy request received', req.body);
    const { intent, dailyLimit, walletAddress, parsedRules: bodyParsedRules, rulesBlobId: bodyRulesBlobId } = req.body;

    // Basic input validation
    if (!intent || typeof intent !== 'string' || intent.length > CONSTANTS.MAX_INTENT_LENGTH) {
      return res.status(400).json({ error: 'Invalid intent' });
    }
    if (!dailyLimit || isNaN(Number(dailyLimit)) || Number(dailyLimit) <= 0 || Number(dailyLimit) > 1000000) {
      return res.status(400).json({ error: 'Invalid dailyLimit' });
    }
    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress is required' });
    }

    const agentWallet = generateAgentWallet();
    const agentId = uuidv4();

    let parsedRules = bodyParsedRules ?? null;
    if (!parsedRules && intent) {
      logger.info(`[Deploy] Parsing intent for agent ${agentId}...`);
      parsedRules = await parseIntent(intent);
    }

    let rulesBlobId = bodyRulesBlobId ?? null;
    if (parsedRules && !rulesBlobId) {
      rulesBlobId = await publishAgentBlob('rules', agentId, {
        intent,
        parsedRules,
        timestamp: new Date().toISOString(),
      });
    }

    const strategy = {
      id: agentId,
      intent,
      dailyLimit,
      walletAddress,
      agentWalletAddress: agentWallet.address,
      agentPrivateKey: agentWallet.privateKey, // stored in SQLite only
      createdAt: new Date().toISOString(),
      paused: false,
      spentToday: 0,
      lastRun: null,
      parsedRules,
      rulesBlobId,
    };

    const strategyBlobId = await publishAgentBlob('strategy', strategy.id, {
      ...strategy,
      agentPrivateKey: undefined // never store key in Walrus
    });

    const fullAgent: Agent = {
      ...strategy,
      strategyBlobId,
      logBlobId: null as any,
      logs: [],
    };

    agents[strategy.id] = fullAgent;
    saveAgent(fullAgent);

    broadcast('agent_deployed', {
      agentId: strategy.id,
      intent: strategy.intent,
      strategyBlobId,
      timestamp: new Date().toISOString(),
    });

    await publishAgentIndex();

    res.json({
      success: true,
      agentId: strategy.id,
      strategyBlobId,
      rulesBlobId,
      parsedRules,
      agentWalletAddress: agentWallet.address,
    });
  } catch (err: any) {
    logger.error('Deploy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/meta/tatum-proof', async (req: Request, res: Response) => {
  try {
    const start = Date.now();

    const [checkpoint, suiPrice, btcPrice] = await Promise.all([
      rpcCall('sui_getLatestCheckpointSequenceNumber', []),
      getSuiPrice(),
      getExchangeRate('BTC'),
    ]);

    res.json({
      proof: 'Tatum Sui RPC Integration Active',
      network: 'sui-mainnet',
      gatewayUrl: 'https://sui-mainnet.gateway.tatum.io',
      data: {
        latestCheckpoint: checkpoint,
        suiPriceUsd: suiPrice,
        btcPriceUsd: btcPrice,
        responseTimeMs: Date.now() - start,
      },
      apis: [
        'Tatum RPC Gateway — sui_getLatestCheckpointSequenceNumber',
        'Tatum Rate API — SUI/USD',
        'Tatum Rate API — BTC/USD',
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/meta/price', async (req: Request, res: Response) => {
  try {
    const price = await getSuiPrice();
    res.json({
      price,
      asset: 'SUI',
      basePair: 'USD',
      timestamp: new Date().toISOString(),
      source: 'Tatum Rate API',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/meta/tatum-status', async (req: Request, res: Response) => {
  try {
    const status = await getTatumNodeStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/meta/tatum-metrics', async (req: Request, res: Response) => {
  try {
    const history = getLatencyHistory();
    const avgLatency = getAverageLatency();
    const status = await getTatumNodeStatus();
    res.json({
      currentLatencyMs: status.latencyMs,
      averageLatencyMs: avgLatency,
      totalCalls: history.length,
      recentCalls: history.slice(0, 10),
      network: status.network,
      checkpoint: status.checkpoint,
      online: status.online,
      rateLimit: '2 RPS (free plan safe)',
      poweredBy: 'Tatum Enterprise RPC',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/meta/rates', async (req: Request, res: Response) => {
  try {
    const [sui, btc, eth] = await Promise.all([
      getExchangeRate('SUI'),
      getExchangeRate('BTC'),
      getExchangeRate('ETH'),
    ]);
    res.json({
      rates: { SUI: sui, BTC: btc, ETH: eth },
      basePair: 'USD',
      timestamp: new Date().toISOString(),
      source: 'Tatum Data API',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get agent status (strip private key from response)
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const agentId = req.params.id;
    const agent = agents[agentId] ?? getAgent(agentId);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const balance = await getSuiBalance(
      agent.agentWalletAddress ?? agent.walletAddress
    );

    // Never expose private key to frontend
    const { agentPrivateKey, ...safeAgent } = agent;
    res.json({ ...safeAgent, balance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all agents
router.get('/', async (req: Request, res: Response) => {
  try {
    const list = Object.values(agents).map(({ agentPrivateKey, ...a }) => ({
      id: a.id,
      intent: a.intent,
      paused: a.paused,
      strategyBlobId: a.strategyBlobId,
      logBlobId: a.logBlobId,
      lastRun: a.lastRun,
      createdAt: a.createdAt,
      dailyLimit: a.dailyLimit,
      agentWalletAddress: a.agentWalletAddress,
      logs: a.logs ?? [],
    }));
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get agent logs from Walrus
router.get('/:id/logs', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const agentId = req.params.id;
    const agent = agents[agentId];
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    res.json({ logs: agent.logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Pause or resume agent
router.post('/:id/pause', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const agentId = req.params.id;
    const agent = agents[agentId];
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    agent.paused = !agent.paused;
    saveAgent(agent);
    await publishAgentIndex();

    const logEntry = {
      agentId,
      action: agent.paused ? 'paused' : 'resumed',
      timestamp: new Date().toISOString(),
    };

    const logBlobId = await publishAgentBlob('pause', agentId, logEntry);
    agent.logBlobId = logBlobId;
    agent.logs.push({
      blobId: logBlobId,
      timestamp: logEntry.timestamp,
      action: logEntry.action,
      status: 'ok',
    });

    res.json({ paused: agent.paused, logBlobId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/swap', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const agentId = req.params.id;
    const agent = agents[agentId];
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (agent.paused) return res.status(400).json({ error: 'Agent is paused' });

    const { fromToken = 'SUI', toToken = 'USDC', amount } = req.body;

    const result = await executeSwap({
      agentId: agent.id,
      fromToken,
      toToken,
      amount: Number(amount),
      walletAddress: agent.agentWalletAddress ?? agent.walletAddress,
    });

    // Log swap to Walrus
    const logEntry = {
      agentId: agent.id,
      action: 'swap',
      fromToken, toToken, amount,
      result,
      timestamp: new Date().toISOString(),
    };
    const logBlobId = await publishAgentBlob('swap', agent.id, logEntry);
    agent.logBlobId = logBlobId;
    agent.logs.push({ blobId: logBlobId, timestamp: logEntry.timestamp, action: 'swap', status: result.success ? 'ok' : 'failed' });
    saveAgent(agent);

    res.json({ ...result, logBlobId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Manual DCA swap trigger (for testing)
router.post('/:id/dca-swap', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const agentId = req.params.id;
    const agent = agents[agentId];
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (agent.paused) return res.status(400).json({ error: 'Agent is paused' });

    const { amountUsd = agent.dailyLimit, fromToken = 'SUI', toToken = 'USDC' } = req.body;

    const swapResult = await executeDCASwap({
      agentId: agent.id,
      walletAddress: agent.agentWalletAddress ?? agent.walletAddress,
      amountUsd: Number(amountUsd),
      fromToken,
      toToken,
    });

    // Log DCA swap to database and Walrus
    const swapLog = {
      blobId: swapResult.blobId,
      timestamp: new Date().toISOString(),
      action: 'dca_swap_manual',
      status: swapResult.success ? 'executed' : 'skipped',
    };

    agent.logs = [swapLog, ...(agent.logs ?? [])];
    agent.logBlobId = swapResult.blobId;
    saveAgent(agent);
    saveLog(agent.id, swapLog);

    res.json({
      success: swapResult.success,
      blobId: swapResult.blobId,
      txDigest: swapResult.txDigest,
      price: swapResult.price,
      message: swapResult.success 
        ? `DCA swap executed: $${amountUsd} USD → SUI @ $${swapResult.price}`
        : 'DCA swap skipped due to insufficient balance'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;