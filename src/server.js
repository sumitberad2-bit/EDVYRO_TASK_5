import 'dotenv/config';
import { app } from './app.js';
import { logger } from './logger.js';
const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => logger.info('server_started', { port, environment: process.env.NODE_ENV || 'development' }));
function shutdown(signal) {
  logger.info('server_shutdown', { signal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
