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
  { name: 'CLERK_SECRET_KEY', default: '' },
  { name: 'CLERK_PUBLISHABLE_KEY', default: '' },
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

  if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_PUBLISHABLE_KEY) {
    logger.warn('CLERK_SECRET_KEY is set but CLERK_PUBLISHABLE_KEY is missing');
  }

  if (process.env.JWT_SECRET === 'change-this-to-a-random-secret-in-production' && process.env.NODE_ENV === 'production') {
    logger.warn('JWT_SECRET is still set to the default development value. Change it in production!');
  }

  logger.info('Environment validation passed');
};
