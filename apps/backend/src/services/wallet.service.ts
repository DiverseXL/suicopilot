import crypto from 'crypto';

// Generate a Sui-compatible wallet address using Node crypto
// For hackathon demo — full signing uses frontend wallet
export function generateAgentWallet(): {
  address: string;
  privateKey: string;
} {
  // Generate 32 random bytes for the keypair
  const privateKeyBytes = crypto.randomBytes(32);
  const privateKey = privateKeyBytes.toString('hex');

  // Generate a deterministic Sui-style address from the private key
  const hash = crypto
    .createHash('sha256')
    .update(privateKeyBytes)
    .digest('hex');

  const address = `0x${hash.slice(0, 64)}`;

  return { address, privateKey };
}

export function getAgentWalletInfo(privateKeyHex: string): { address: string } {
  const bytes = Buffer.from(privateKeyHex, 'hex');
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  return { address: `0x${hash.slice(0, 64)}` };
}
