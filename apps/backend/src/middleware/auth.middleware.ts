import { Request, Response, NextFunction } from 'express';

export async function requireWalletAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    const signature = req.headers['x-wallet-signature'] as string;
    const message = req.headers['x-wallet-message'] as string;

    if (!walletAddress || !signature || !message) {
      return res.status(401).json({
        error: 'Authentication required',
        hint: 'Include x-wallet-address, x-wallet-signature, x-wallet-message headers'
      });
    }

    // Verify the signature matches the wallet address
    const messageBytes = new TextEncoder().encode(message);
    const { verifyPersonalMessageSignature } = await import('@mysten/sui/verify');
    const publicKey = await verifyPersonalMessageSignature(
      messageBytes,
      signature
    );

    const recoveredAddress = publicKey.toSuiAddress();

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Attach wallet address to request
    (req as any).walletAddress = walletAddress;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Signature verification failed' });
  }
}
