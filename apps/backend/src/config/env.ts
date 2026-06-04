import { logger } from '../utils/logger';

const REQUIRED_ENV = [
  'TATUM_API_KEY',
  'SUI_RPC_URL',
  'OPENAI_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    logger.error(
      `[env] Missing required variables: ${missing.join(', ')}\n` +
        'Set them in apps/backend/.env (see .env.example).'
    );
    process.exit(1);
  }

  logger.info('[env] TATUM_API_KEY, SUI_RPC_URL, OPENAI_API_KEY present');
}
