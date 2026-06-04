import axios from 'axios';
import OpenAI from 'openai';
import { getSuiPrice } from './tatum.service';
import { CONSTANTS } from '../config/constants';

const RPC_URL = process.env.SUI_RPC_URL!;
const API_KEY = process.env.TATUM_API_KEY!;

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

// Execute any Sui RPC call via Tatum gateway
export async function executeRpc(method: string, params: any[]): Promise<any> {
  const res = await axios.post(RPC_URL, {
    jsonrpc: '2.0', id: 1, method, params
  }, { headers, timeout: CONSTANTS.TATUM_RPC_TIMEOUT_MS });
  return res.data.result;
}

// Get SUI balance for an address
export async function getWalletBalance(address: string): Promise<{
  balanceMist: string;
  balanceSui: number;
}> {
  const result = await executeRpc('suix_getBalance', [address, '0x2::sui::SUI']);
  const mist = result.totalBalance ?? '0';
  return {
    balanceMist: mist,
    balanceSui: Number(mist) / 1_000_000_000,
  };
}

// Get recent transactions for an address via Tatum
export async function getTransactionHistory(address: string): Promise<any[]> {
  const result = await executeRpc('suix_queryTransactionBlocks', [
    { filter: { FromAddress: address }, options: { showEffects: true, showInput: true } },
    null, 10, true
  ]);
  return result?.data ?? [];
}


// Check if an address is malicious before agent executes
export async function checkMaliciousAddress(address: string): Promise<boolean> {
  try {
    const res = await axios.get(
      `https://api.tatum.io/v3/security/address/${address}?chain=SUI`,
      { headers: { 'x-api-key': API_KEY }, timeout: CONSTANTS.TATUM_RPC_TIMEOUT_MS }
    );
    return res.data?.malicious === true;
  } catch {
    return false;
  }
}

// Parse natural language intent into structured rules using OpenAI
export async function parseIntent(intent: string): Promise<{
  action: string;
  asset: string;
  amount: number;
  interval: string;
  stopLoss?: number;
  takeProfit?: number;
  priceDropPct?: number;
  priceRisePct?: number;
  condition?: string;
}> {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a DeFi trading strategy parser for the Sui blockchain. 
Parse the user's intent into structured JSON only. Be precise about numbers and conditions.
No explanation, no markdown, just valid JSON.`
      },
      {
        role: 'user',
        content: `Parse this trading strategy into JSON:
"${intent}"

Return ONLY this JSON structure:
{
  "action": "dca|buy|sell|monitor|alert",
  "asset": "SUI",
  "amount": 10,
  "interval": "hourly|daily|weekly",
  "stopLoss": null,
  "takeProfit": null,
  "priceDropPct": null,
  "priceRisePct": null,
  "condition": "description of trigger condition or null"
}

Rules:
- action "dca" = recurring buy at fixed intervals
- action "buy" = buy when condition met
- action "sell" = sell when condition met  
- action "monitor" = watch and alert only
- stopLoss = USD balance threshold to pause agent
- takeProfit = SUI price target to sell
- priceDropPct = percentage drop to trigger buy
- interval defaults to "daily" if not specified`
      }
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  try {
    const text = completion.choices[0].message.content ?? '{}';
    return JSON.parse(text);
  } catch {
    return { action: 'dca', asset: 'SUI', amount: 10, interval: 'daily' };
  }
}