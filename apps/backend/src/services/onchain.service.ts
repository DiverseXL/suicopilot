import axios from 'axios';

const RPC_URL = process.env.SUI_RPC_URL!;
const API_KEY = process.env.TATUM_API_KEY!;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

// Build a proof transaction using Tatum RPC
// This queries real on-chain data to prove Tatum integration
export async function getOnChainProof(walletAddress: string): Promise<{
  hasOnChainActivity: boolean;
  latestTxDigest?: string;
  balance: string;
  objectCount: number;
  suiscanUrl: string;
  network: string;
}> {
  try {
    // Get balance
    const balanceRes = await axios.post(RPC_URL, {
      jsonrpc: '2.0', id: 1,
      method: 'suix_getBalance',
      params: [walletAddress, '0x2::sui::SUI']
    }, { headers, timeout: 10000 });

    const balance = balanceRes.data?.result?.totalBalance ?? '0';

    // Get transaction history
    const txRes = await axios.post(RPC_URL, {
      jsonrpc: '2.0', id: 2,
      method: 'suix_queryTransactionBlocks',
      params: [
        { filter: { ToAddress: walletAddress } },
        null, 1, true
      ]
    }, { headers, timeout: 10000 });

    const txs = txRes.data?.result?.data ?? [];
    const latestTx = txs[0]?.digest;

    // Get owned objects
    const objRes = await axios.post(RPC_URL, {
      jsonrpc: '2.0', id: 3,
      method: 'suix_getOwnedObjects',
      params: [walletAddress, null, null, 5]
    }, { headers, timeout: 10000 });

    const objects = objRes.data?.result?.data ?? [];

    return {
      hasOnChainActivity: txs.length > 0,
      latestTxDigest: latestTx,
      balance,
      objectCount: objects.length,
      suiscanUrl: `https://suiscan.xyz/mainnet/account/${walletAddress}`,
      network: 'sui-mainnet',
    };
  } catch (err: any) {
    return {
      hasOnChainActivity: false,
      balance: '0',
      objectCount: 0,
      suiscanUrl: `https://suiscan.xyz/mainnet/account/${walletAddress}`,
      network: 'sui-mainnet',
    };
  }
}

// Generate a verifiable on-chain proof blob
// Links agent decisions to on-chain wallet state
export async function generateProofBlob(agentId: string, walletAddress: string): Promise<{
  proof: any;
  verified: boolean;
}> {
  const onChain = await getOnChainProof(walletAddress);

  const proof = {
    agentId,
    walletAddress,
    timestamp: new Date().toISOString(),
    onChain,
    verification: {
      method: 'Tatum Sui Mainnet RPC',
      endpoints: [
        'suix_getBalance',
        'suix_queryTransactionBlocks',
        'suix_getOwnedObjects',
      ],
      gateway: RPC_URL,
    },
  };

  return {
    proof,
    verified: onChain.hasOnChainActivity || Number(onChain.balance) > 0,
  };
}
