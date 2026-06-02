import cron from 'node-cron';
import OpenAI from 'openai';
import { getSuiPrice, getSuiBalance } from './tatum.service';
import { publishAgentBlob } from './walrus.service';
import { loadAllAgents, saveAgent, saveLog } from './db.service';
import { executeDCASwap } from './swap.service';
import { broadcast } from '../realtime';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

let healthCheckCounter = 0;
const agentRunCounts: Record<string, number> = {};

// Load persisted agents from SQLite on startup
export const agents: Record<string, any> = loadAllAgents();
console.log(`Loaded ${Object.keys(agents).length} agents from SQLite`);

export function startScheduler() {
  console.log('Scheduler started');

  cron.schedule('* * * * *', async () => {
    const activeAgents = Object.values(agents).filter(a => !a.paused);

    if (activeAgents.length > 0) {
      console.log(`Scheduler: running ${activeAgents.length} agents in parallel`);

      // Fix 2: run ALL agents in parallel, never block on one failure
      const results = await Promise.allSettled(
        activeAgents.map(agent => runAgentSafe(agent))
      );

      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(`Agent ${activeAgents[i].id} failed:`, result.reason);
        }
      });
    }

    healthCheckCounter++;
    if (healthCheckCounter % 10 === 0) {
      await runHealthChecks();
    }
  });
}

async function runAgentSafe(agent: any): Promise<void> {
  // Add per-agent timeout — never let one RPC hang block others
  return Promise.race([
    runAgent(agent),
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Agent timeout after 30s')), 30_000)
    ),
  ]);
}

async function runAgent(agent: any): Promise<void> {
  const now = new Date();

  // Reset daily spend at midnight
  const lastRun = agent.lastRun ? new Date(agent.lastRun) : null;
  if (!lastRun || lastRun.toDateString() !== now.toDateString()) {
    agent.spentToday = 0;
  }

  if (agent.spentToday >= agent.dailyLimit) {
    console.log(`Agent ${agent.id}: daily limit reached`);
    return;
  }

  // Get live data via Tatum
  const [balance, suiPrice] = await Promise.all([
    getSuiBalance(agent.agentWalletAddress ?? agent.walletAddress),
    getSuiPrice(),
  ]);

  const balanceSui = Number(balance) / 1_000_000_000;
  const balanceUsd = balanceSui * suiPrice;
  const rules = agent.parsedRules;

  // ── DECISION ENGINE ──────────────────────────────────────
  let decision = 'hold';
  let reason = 'No conditions met';
  let action = 'monitor';

  if (rules) {
    // DCA strategy — execute if interval has passed
    if (rules.action === 'dca') {
      const lastRunDca = agent.lastRun ? new Date(agent.lastRun) : null;
      const intervalHours = rules.interval === 'hourly' ? 1
        : rules.interval === 'weekly' ? 168 : 24;
      const hoursSinceLastRun = lastRunDca
        ? (now.getTime() - lastRunDca.getTime()) / (1000 * 60 * 60)
        : Infinity;

      if (hoursSinceLastRun >= intervalHours) {
        decision = 'execute_dca';
        reason = `DCA interval reached (${intervalHours}h). Buying $${rules.amount} of ${rules.asset ?? 'SUI'}`;
        action = 'dca_buy';
        agent.spentToday += rules.amount ?? agent.dailyLimit;
      } else {
        reason = `DCA interval not reached. Next run in ${(intervalHours - hoursSinceLastRun).toFixed(1)}h`;
      }
    }

    // Stop loss check
    if (rules.stopLoss && balanceUsd < rules.stopLoss) {
      decision = 'stop_loss_triggered';
      reason = `Balance $${balanceUsd.toFixed(2)} below stop loss $${rules.stopLoss}. Pausing agent.`;
      action = 'pause';
      agent.paused = true;
    }

    // Take profit check
    if (rules.takeProfit && suiPrice >= rules.takeProfit) {
      decision = 'take_profit_triggered';
      reason = `SUI price $${suiPrice} reached take profit $${rules.takeProfit}`;
      action = 'sell';
    }

    // Buy dip strategy
    if (rules.action === 'buy' && rules.priceDropPct) {
      reason = `Monitoring for ${rules.priceDropPct}% dip. Current price: $${suiPrice}`;
    }
  }

  // ── BUILD EXECUTION LOG ───────────────────────────────────
  const logEntry = {
    agentId: agent.id,
    timestamp: now.toISOString(),
    action,
    decision,
    reason,
    intent: agent.intent,
    marketData: {
      suiPrice,
      balanceSui,
      balanceUsd: balanceUsd.toFixed(2),
    },
    limits: {
      dailyLimit: agent.dailyLimit,
      spentToday: agent.spentToday,
      remaining: agent.dailyLimit - agent.spentToday,
    },
    rules: rules ?? null,
    status: 'checked',
    withinLimit: agent.spentToday < agent.dailyLimit,
  };

  // Publish to Walrus
  const logBlobId = await publishAgentBlob('execution', agent.id, logEntry);

  const log = {
    blobId: logBlobId,
    timestamp: now.toISOString(),
    action,
    status: decision === 'hold' ? 'checked' : decision,
  };

  agent.logBlobId = logBlobId;
  agent.lastRun = now.toISOString();
  agent.logs = [log, ...(agent.logs ?? [])];

  // Keep only last 50 logs in memory
  if (agent.logs.length > 50) {
    agent.logs = agent.logs.slice(0, 50);
  }

  saveAgent(agent);
  saveLog(agent.id, log);

  // Performance report every 10 runs
  agentRunCounts[agent.id] = (agentRunCounts[agent.id] ?? 0) + 1;
  if (agentRunCounts[agent.id] % 10 === 0) {
    try {
      await publishPerformanceReport(agent);
    } catch (e: any) {
      console.error(`[Performance] Report failed for ${agent.id}:`, e.message);
    }
  }

  broadcast('agent_execution', {
    agentId: agent.id,
    intent: agent.intent,
    blobId: logBlobId,
    timestamp: now.toISOString(),
    balanceSui,
    status: log.status,
    decision,
    reason,
    suiPrice,
  });

  console.log(`Agent ${agent.id}: [${decision}] ${reason} → blob: ${logBlobId}`);

  if (decision === 'execute_dca' && rules) {
    try {
      const swapResult = await executeDCASwap({
        agentId: agent.id,
        walletAddress: agent.agentWalletAddress ?? agent.walletAddress,
        amountUsd: rules.amount ?? agent.dailyLimit,
        fromToken: rules.asset ?? 'SUI',
        toToken: 'USDC',
      });

      const swapLog = {
        blobId: swapResult.blobId,
        timestamp: new Date().toISOString(),
        action: 'dca_swap',
        status: swapResult.success ? 'executed' : 'skipped',
      };

      agent.logs = [swapLog, ...(agent.logs ?? [])];
      if (swapResult.blobId) agent.logBlobId = swapResult.blobId;
      saveAgent(agent);
      saveLog(agent.id, swapLog);

      broadcast('agent_execution', {
        agentId: agent.id,
        intent: agent.intent,
        blobId: swapResult.blobId,
        decision: 'dca_swap',
        reason: swapResult.success
          ? `DCA swap executed (simulated) @ $${swapResult.price?.toFixed(4) ?? '?'}`
          : 'DCA swap skipped — insufficient balance',
        suiPrice,
        balanceSui,
        timestamp: new Date().toISOString(),
        status: swapLog.status,
      });

      console.log(
        `Agent ${agent.id}: DCA swap ${swapResult.success ? 'executed' : 'skipped'} → blob: ${swapResult.blobId}`
      );
    } catch (err: any) {
      console.error(`Agent ${agent.id}: DCA swap error:`, err.message);
    }
  }
}

async function runHealthChecks(): Promise<void> {
  const allAgents = Object.values(agents);
  if (allAgents.length === 0) return;

  for (const agent of allAgents) {
    if (!agent.parsedRules || agent.paused) continue;

    try {
      const suiPrice = await getSuiPrice();
      const balance = await getSuiBalance(
        agent.agentWalletAddress ?? agent.walletAddress
      );
      const balanceSui = Number(balance) / 1_000_000_000;
      const balanceUsd = balanceSui * suiPrice;

      const assessment = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `You are an AI agent health monitor. Assess this trading agent:

Strategy: "${agent.intent}"
Parsed rules: ${JSON.stringify(agent.parsedRules)}
Current SUI price: $${suiPrice}
Wallet balance: ${balanceSui.toFixed(4)} SUI ($${balanceUsd.toFixed(2)})
Daily limit: $${agent.dailyLimit}
Spent today: $${agent.spentToday}
Last run: ${agent.lastRun ?? 'never'}
Total executions: ${agent.logs?.length ?? 0}

Respond with JSON only:
{
  "health": "good|warning|critical",
  "message": "one sentence assessment",
  "recommendation": "one actionable suggestion"
}`
        }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const healthData = JSON.parse(
        assessment.choices[0].message.content ?? '{}'
      );

      const blobId = await publishAgentBlob('execution', agent.id, {
        action: 'health_check',
        ...healthData,
        suiPrice,
        balanceSui,
        balanceUsd,
        timestamp: new Date().toISOString(),
      });

      const log = {
        blobId,
        timestamp: new Date().toISOString(),
        action: 'health_check',
        status: healthData.health,
      };

      agent.logs = [log, ...(agent.logs ?? [])];
      agent.logBlobId = blobId;
      saveAgent(agent);
      saveLog(agent.id, log);

      broadcast('agent_health', {
        agentId: agent.id,
        ...healthData,
        blobId,
        timestamp: new Date().toISOString(),
      });

      console.log(`[Health] Agent ${agent.id}: ${healthData.health} — ${healthData.message}`);
    } catch (err: any) {
      console.error(`[Health] Agent ${agent.id} check failed:`, err.message);
    }
  }
}

async function publishPerformanceReport(agent: any): Promise<void> {
  const logs = agent.logs ?? [];
  const totalRuns = logs.length;
  const successfulRuns = logs.filter((l: any) =>
    l.status === 'checked' || l.status === 'executed'
  ).length;
  const dcaRuns = logs.filter((l: any) => l.action === 'dca_swap').length;

  const report = {
    agentId: agent.id,
    intent: agent.intent,
    reportType: 'performance_summary',
    timestamp: new Date().toISOString(),
    metrics: {
      totalRuns,
      successfulRuns,
      successRate: totalRuns > 0
        ? ((successfulRuns / totalRuns) * 100).toFixed(1) + '%'
        : '0%',
      dcaExecutions: dcaRuns,
      dailyLimit: agent.dailyLimit,
      spentToday: agent.spentToday,
      remainingBudget: agent.dailyLimit - agent.spentToday,
      uptime: agent.createdAt
        ? Math.floor(
            (Date.now() - new Date(agent.createdAt).getTime()) / (1000 * 60 * 60)
          ) + ' hours'
        : 'unknown',
    },
    poweredBy: 'Walrus Immutable Storage + Tatum RPC',
  };

  const blobId = await publishAgentBlob('execution', agent.id, report);

  const log = {
    blobId,
    timestamp: new Date().toISOString(),
    action: 'performance_report',
    status: 'published',
  };

  agent.logs = [log, ...(agent.logs ?? [])];
  agent.logBlobId = blobId;
  saveAgent(agent);
  saveLog(agent.id, log);

  broadcast('performance_report', {
    agentId: agent.id,
    blobId,
    metrics: report.metrics,
    timestamp: report.timestamp,
  });

  console.log(`[Performance] Agent ${agent.id}: report published → ${blobId}`);
}
