import { config } from './app/config';
config.load(process.env.NODE_ENV || 'dev');
import { bootstrap } from './bootstrap';
import { logger } from './app/logger';

const PORT = config.get().turvis.application.port || 8060;
const HOST = config.get().turvis.application.host || '::';

export const app = bootstrap({ logger: logger });

const startApp = async (): Promise<void> =>
  app.listen({ port: PORT, host: HOST }, (error) => {
    if (error) {
      logger.error(error);
      process.exit(1);
    }
  });

const start = async (): Promise<void> => {
  try {
    await startApp();
  } catch (error) {
    logger.error('Error starting the application', error);
    process.exit(1);
  }
};

start();
