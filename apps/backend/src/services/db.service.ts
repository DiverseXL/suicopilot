import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(path.join(DB_DIR, 'suicopilot.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    intent TEXT NOT NULL,
    daily_limit REAL NOT NULL,
    wallet_address TEXT NOT NULL,
    agent_wallet_address TEXT,
    agent_private_key TEXT,
    strategy_blob_id TEXT,
    log_blob_id TEXT,
    rules_blob_id TEXT,
    parsed_rules TEXT,
    paused INTEGER DEFAULT 0,
    spent_today REAL DEFAULT 0,
    last_run TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    blob_id TEXT,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  );

  CREATE INDEX IF NOT EXISTS idx_agents_id ON agents(id);
  CREATE INDEX IF NOT EXISTS idx_logs_agent_id ON logs(agent_id);
  CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
`);

export function saveAgent(agent: any): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO agents (
      id, intent, daily_limit, wallet_address, agent_wallet_address,
      agent_private_key, strategy_blob_id, log_blob_id, rules_blob_id,
      parsed_rules, paused, spent_today, last_run, created_at
    ) VALUES (
      @id, @intent, @dailyLimit, @walletAddress, @agentWalletAddress,
      @agentPrivateKey, @strategyBlobId, @logBlobId, @rulesBlobId,
      @parsedRules, @paused, @spentToday, @lastRun, @createdAt
    )
  `);
  stmt.run({
    id: agent.id,
    intent: agent.intent,
    dailyLimit: agent.dailyLimit,
    walletAddress: agent.walletAddress,
    agentWalletAddress: agent.agentWalletAddress ?? null,
    agentPrivateKey: agent.agentPrivateKey ?? null,
    strategyBlobId: agent.strategyBlobId ?? null,
    logBlobId: agent.logBlobId ?? null,
    rulesBlobId: agent.rulesBlobId ?? null,
    parsedRules: agent.parsedRules ? JSON.stringify(agent.parsedRules) : null,
    paused: agent.paused ? 1 : 0,
    spentToday: agent.spentToday ?? 0,
    lastRun: agent.lastRun ?? null,
    createdAt: agent.createdAt,
  });
}

export function saveLog(agentId: string, log: any): void {
  db.prepare(`
    INSERT INTO logs (agent_id, blob_id, action, status, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run(agentId, log.blobId ?? null, log.action, log.status, log.timestamp);
}

export function loadAllAgents(): Record<string, any> {
  const rows = db.prepare('SELECT * FROM agents').all() as any[];
  const result: Record<string, any> = {};
  for (const row of rows) {
    const logs = db.prepare(
      'SELECT * FROM logs WHERE agent_id = ? ORDER BY timestamp DESC'
    ).all(row.id) as any[];
    result[row.id] = {
      id: row.id,
      intent: row.intent,
      dailyLimit: row.daily_limit,
      walletAddress: row.wallet_address,
      agentWalletAddress: row.agent_wallet_address,
      agentPrivateKey: row.agent_private_key,
      strategyBlobId: row.strategy_blob_id,
      logBlobId: row.log_blob_id,
      rulesBlobId: row.rules_blob_id,
      parsedRules: row.parsed_rules ? JSON.parse(row.parsed_rules) : null,
      paused: row.paused === 1,
      spentToday: row.spent_today,
      lastRun: row.last_run,
      createdAt: row.created_at,
      logs,
    };
  }
  return result;
}

export function getAgent(id: string): any | null {
  const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as any;
  if (!row) return null;
  const logs = db.prepare(
    'SELECT * FROM logs WHERE agent_id = ? ORDER BY timestamp DESC'
  ).all(id) as any[];
  return {
    id: row.id,
    intent: row.intent,
    dailyLimit: row.daily_limit,
    walletAddress: row.wallet_address,
    agentWalletAddress: row.agent_wallet_address,
    agentPrivateKey: row.agent_private_key,
    strategyBlobId: row.strategy_blob_id,
    logBlobId: row.log_blob_id,
    rulesBlobId: row.rules_blob_id,
    parsedRules: row.parsed_rules ? JSON.parse(row.parsed_rules) : null,
    paused: row.paused === 1,
    spentToday: row.spent_today,
    lastRun: row.last_run,
    createdAt: row.created_at,
    logs,
  };
}

export default db;