import axios from 'axios';

const AGGREGATOR = process.env.WALRUS_AGGREGATOR_URL
  ?? 'https://aggregator.walrus-testnet.walrus.space';

// Testnet publishers — free public access, no authentication required
const PUBLISHERS = [
  'https://publisher.walrus-testnet.walrus.space',
  'https://wal-publisher-testnet.staketab.org',
  'https://walrus-testnet-publisher.bartestnet.com',
];

export async function publishBlob(data: object): Promise<string> {
  let lastError: any;

  for (const publisher of PUBLISHERS) {
    try {
      const response = await axios.put(
        `${publisher}/v1/blobs?epochs=5`,
        JSON.stringify(data),
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000,
        }
      );
      const result = response.data;
      const blobId =
        result?.newlyCreated?.blobObject?.blobId ??
        result?.alreadyCertified?.blobId;
      if (blobId) {
        console.log(`[Walrus] Published via ${publisher} → ${blobId}`);
        return blobId;
      }
    } catch (err: any) {
      console.warn(`[Walrus] ${publisher} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`All Walrus publishers failed: ${lastError?.message}`);
}

export async function fetchBlob(blobId: string): Promise<any> {
  const response = await axios.get(
    `${AGGREGATOR}/v1/${blobId}`,
    { timeout: 10000 }
  );
  return response.data;
}

export async function publishAgentBlob(
  type: 'strategy' | 'execution' | 'swap' | 'pause' | 'rules' | 'index',
  agentId: string,
  data: object
): Promise<string> {
  const envelope = {
    _meta: {
      type,
      agentId,
      app: 'SuiCopilot',
      version: '1.0',
      timestamp: new Date().toISOString(),
      network: process.env.SUI_RPC_URL?.includes('mainnet') ? 'mainnet' : 'testnet',
    },
    ...data,
  };
  return publishBlob(envelope);
}
