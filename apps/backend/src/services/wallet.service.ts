import crypto from 'crypto';

export function generateAgentWallet(): {
  address: string;
  privateKey: string;
} {
  const privateKeyBytes = crypto.randomBytes(32);
  const privateKey = privateKeyBytes.toString('hex');
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
