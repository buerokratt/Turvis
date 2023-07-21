import * as chokidar from 'chokidar';
import { logger } from './logger';
import { config } from './config';
import pLimit from 'p-limit';

const MAX_RETRIES = config.get().turvis.DSL.logs.maxRetries || 3;
const RETRY_DELAY_MS = config.get().turvis.DSL.logs.retryDelay || 1000;
const fileProcessor = pLimit(config.get().turvis.DSL.logs.maxConcurrency || 2);
let restartCount = 0;

function start(directory: string, processFileCallback: (filePath: string) => Promise<void>): void {
  const watcher = chokidar.watch(directory, { ignoreInitial: true });

  const fileCallback = async (filePath: string): Promise<void> => {
    await fileProcessor(() => processFileCallback(filePath));
  };

  watcher.on('add', fileCallback);

  watcher.on('error', (error) => {
    logger.error('File observing error:', JSON.stringify(error));
    restart(directory, processFileCallback);
  });
}

function restart(directory: string, processFileCallback: (filePath: string) => Promise<void>): void {
  if (restartCount < MAX_RETRIES) {
    restartCount++;
    logger.info(`Restarting file monitoring. Attempt ${restartCount} of ${MAX_RETRIES}...`);
    setTimeout(() => {
      try {
        start(directory, processFileCallback);
        restartCount = 0;
      } catch (error) {
        restart(directory, processFileCallback);
      }
    }, RETRY_DELAY_MS);
  } else {
    logger.error('Maximum restart attempts reached. Exiting...');
    process.exit(1);
  }
}

export const watcher = {
  startWatcher: start,
};