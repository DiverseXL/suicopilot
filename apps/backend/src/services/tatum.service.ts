import axios from 'axios';

const RPC_URL = process.env.SUI_RPC_URL!;
const API_KEY = process.env.TATUM_API_KEY!;

// Latency history — last 50 calls
const latencyHistory: Array<{ timestamp: string; latencyMs: number; method: string }> = [];

export function getLatencyHistory() {
  return latencyHistory;
}

export function getAverageLatency(): number {
  if (latencyHistory.length === 0) return 0;
  const sum = latencyHistory.reduce((acc, l) => acc + l.latencyMs, 0);
  return Math.round(sum / latencyHistory.length);
}

// Rate limiter — max 2 requests per second (safe under 3 RPS free limit)
let lastCallTime = 0;
const MIN_INTERVAL_MS = 500; // 2 RPS max

async function rateLimitedCall() {
  const now = Date.now();
  const wait = MIN_INTERVAL_MS - (now - lastCallTime);
  if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
  lastCallTime = Date.now();
}

async function rpcCall(method: string, params: any[]) {
  await rateLimitedCall();
  const start = Date.now();
  const response = await axios.post(
    RPC_URL,
    { jsonrpc: '2.0', id: 1, method, params },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      timeout: 10000,
    }
  );
  const latencyMs = Date.now() - start;
  latencyHistory.unshift({ timestamp: new Date().toISOString(), latencyMs, method });
  if (latencyHistory.length > 50) latencyHistory.pop();
  return response.data.result;
}

export async function getSuiBalance(address: string): Promise<string> {
  const result = await rpcCall('suix_getBalance', [address, '0x2::sui::SUI']);
  return result?.totalBalance ?? '0';
}

export async function getRecentTransactions(address: string): Promise<any[]> {
  const result = await rpcCall('suix_queryTransactionBlocks', [
    { filter: { FromAddress: address }, options: { showEffects: true } },
    null, 5, true
  ]);
  return result?.data ?? [];
}

export async function getSuiPrice(): Promise<number> {
  try {
    await rateLimitedCall();
    const res = await axios.get(
      'https://api.tatum.io/v3/tatum/rate/SUI?basePair=USD',
      {
        headers: { 'x-api-key': API_KEY },
        timeout: 5000,
      }
    );
    return Number(res.data?.value) ?? 0;
  } catch {
    return 0;
  }
}

export async function getTatumNodeStatus(): Promise<any> {
  const start = Date.now();
  try {
    const result = await rpcCall('sui_getLatestCheckpointSequenceNumber', []);
    return {
      online: true,
      latencyMs: Date.now() - start,
      checkpoint: result ?? '0',
      network: RPC_URL.includes('mainnet') ? 'mainnet' : 'testnet',
    };
  } catch {
    return {
      online: false,
      latencyMs: Date.now() - start,
      checkpoint: '0',
      network: 'unknown',
    };
  }
}

export async function getExchangeRate(asset: string, basePair = 'USD'): Promise<number> {
  try {
    await rateLimitedCall();
    const res = await axios.get(
      `https://api.tatum.io/v3/tatum/rate/${asset}?basePair=${basePair}`,
      { headers: { 'x-api-key': API_KEY }, timeout: 5000 }
    );
    return Number(res.data?.value ?? 0);
  } catch {
    return 0;
  }
}

export async function getAllBalances(address: string): Promise<any[]> {
  const result = await rpcCall('suix_getAllBalances', [address]);
  return result ?? [];
}

export async function getTransactionHistory(address: string): Promise<any[]> {
  const result = await rpcCall('suix_queryTransactionBlocks', [
    { filter: { FromAddress: address }, options: { showEffects: true, showInput: true } },
    null, 10, true
  ]);
  return result?.data ?? [];
}

export async function checkMaliciousAddress(address: string): Promise<any> {
  try {
    await rateLimitedCall();
    const res = await axios.get(
      `https://api.tatum.io/v3/security/address/${address}?chain=SUI`,
      { headers: { 'x-api-key': API_KEY }, timeout: 5000 }
    );
    return { malicious: res.data?.malicious === true, reason: res.data?.reason };
  } catch {
    return { malicious: false };
  }
}
