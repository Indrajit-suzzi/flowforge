import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]({
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length') || 0,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
      tenantId: req.tenant,
      apiKeyId: req.apiKeyId,
    }, `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration}ms`);
  });

  next();
};

export default requestLogger;
