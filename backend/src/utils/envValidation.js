import logger from './logger.js';

const REQUIRED_VARS = [
  { name: 'MONGO_URI', hint: 'mongodb://127.0.0.1:27017/flowforge' },
  { name: 'JWT_SECRET', hint: 'a random 64-character string' },
];

const OPTIONAL_VARS = [
  { name: 'PORT', default: '3000' },
  { name: 'NODE_ENV', default: 'development' },
  { name: 'LOG_LEVEL', default: 'debug' },
  { name: 'CORS_ORIGINS', default: 'http://localhost:5173,http://localhost:3000' },
  { name: 'TRUST_PROXY', default: '0' },
  { name: 'GOOGLE_CLIENT_ID', default: '' },
  { name: 'GOOGLE_CLIENT_SECRET', default: '' },
  { name: 'GITHUB_CLIENT_ID', default: '' },
  { name: 'GITHUB_CLIENT_SECRET', default: '' },
  { name: 'FRONTEND_URL', default: 'http://localhost:5173' },
];

export const validateEnv = () => {
  const missing = [];

  for (const { name, hint } of REQUIRED_VARS) {
    if (!process.env[name]) {
      missing.push({ name, hint });
    }
  }

  if (missing.length > 0) {
    const msg = missing.map(m => `  - ${m.name} (e.g. ${m.hint})`).join('\n');
    logger.fatal(`Missing required environment variables:\n${msg}\n\nCopy .env.example to .env and fill in the values.`);
    process.exit(1);
  }

  for (const { name, default: def } of OPTIONAL_VARS) {
    if (!process.env[name]) {
      process.env[name] = def;
      logger.debug(`Set default for ${name}=${def}`);
    }
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    logger.warn('GOOGLE_CLIENT_ID is missing. Google sign-in will be unavailable.');
  }

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    logger.warn('GitHub OAuth credentials are missing. GitHub sign-in will be unavailable.');
  }

  if (!process.env.WA_SESSION_PATH) {
    process.env.WA_SESSION_PATH = './wa-sessions';
    logger.debug('Set default for WA_SESSION_PATH=./wa-sessions');
  }

  if (process.env.NODE_ENV === 'production' && (
    process.env.JWT_SECRET === 'change-this-to-a-random-secret-in-production'
    || process.env.JWT_SECRET.length < 32
  )) {
    throw new Error('JWT_SECRET must be a non-default secret of at least 32 characters in production');
  }

  logger.info('Environment validation passed');
};
