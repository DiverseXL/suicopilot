import axios from 'axios';
import { publishBlob } from './walrus.service';
import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';

const TATUM_API_KEY = process.env.TATUM_API_KEY!;
const RPC_URL = process.env.SUI_RPC_URL!;

/**
 * Simulate a DCA swap and log it to Walrus
 * Step 1: Get live SUI price via Tatum
 * Step 2: Check wallet balance via Tatum RPC
 * Step 3: Calculate swap amount
 * Step 4: Publish swap record to Walrus for audit trail
 */
export async function executeDCASwap(params: {
  agentId: string;
  walletAddress: string;
  amountUsd: number;
  fromToken: string;
  toToken: string;
}): Promise<{
  success: boolean;
  blobId?: string;
  txDigest?: string;
  simulated: boolean;
  price?: number;
}> {
  // Step 1 — get live SUI price via Tatum
  let suiPrice = 0;
  try {
    const priceRes = await axios.get(
      'https://api.tatum.io/v3/tatum/rate/SUI?basePair=USD',
      { headers: { 'x-api-key': TATUM_API_KEY }, timeout: CONSTANTS.TATUM_PRICE_TIMEOUT_MS }
    );
    suiPrice = Number(priceRes.data?.value ?? 0);
  } catch {
    suiPrice = 1.5; // fallback
  }

  const suiAmount = suiPrice > 0 ? params.amountUsd / suiPrice : 0;

  // Step 2 — check balance via Tatum RPC
  let balanceSui = 0;
  try {
    const balRes = await axios.post(
      RPC_URL,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getBalance',
        params: [params.walletAddress, '0x2::sui::SUI'],
      },
      {
        headers: { 'Content-Type': 'application/json', 'x-api-key': TATUM_API_KEY },
        timeout: CONSTANTS.TATUM_RPC_TIMEOUT_MS,
      }
    );
    balanceSui = Number(balRes.data?.result?.totalBalance ?? 0) / 1_000_000_000;
  } catch {
    balanceSui = 0;
  }

  const canExecute = balanceSui >= suiAmount;

  // Step 3 — build swap record
  const txDigest = `sim_dca_${Date.now()}_${params.agentId.slice(0, 8)}`;

  const swapRecord = {
    agentId: params.agentId,
    type: 'DCA_SWAP',
    timestamp: new Date().toISOString(),
    fromToken: params.fromToken,
    toToken: params.toToken,
    amountUsd: params.amountUsd,
    suiPrice,
    suiAmount: suiAmount.toFixed(6),
    walletBalance: balanceSui,
    canExecute,
    txDigest,
    simulated: true,
    status: canExecute ? 'executed' : 'skipped_insufficient_balance',
    network: 'sui-testnet',
    poweredBy: 'Tatum RPC + Walrus',
  };

  // Step 4 — publish swap log to Walrus
  const blobId = await publishBlob(swapRecord);

  logger.info(
    `[DCA] Agent ${params.agentId}: $${params.amountUsd} → ${suiAmount.toFixed(4)} SUI @ $${suiPrice} | blob: ${blobId}`
  );

  return {
    success: canExecute,
    blobId,
    txDigest,
    simulated: true,
    price: suiPrice,
  };
}

/**
 * Backward compatibility wrapper for old executeSwap calls
 * Converts amount-based swaps to USD-based DCA swaps
 */
export async function executeSwap(params: {
  agentId: string;
  fromToken: string;
  toToken: string;
  amount: number;
  walletAddress: string;
}): Promise<{ success: boolean; txDigest?: string; simulated: boolean }> {
  try {
    // For backward compatibility, treat amount as amount in USD
    const result = await executeDCASwap({
      agentId: params.agentId,
      walletAddress: params.walletAddress,
      amountUsd: params.amount,
      fromToken: params.fromToken,
      toToken: params.toToken,
    });

    return {
      success: result.success,
      txDigest: result.txDigest,
      simulated: result.simulated,
    };
  } catch (err: any) {
    logger.error('Swap error:', err.message);
    return { success: false, simulated: true };
  }
}
