import { createApp } from './app.js';
import { config } from './config.js';
import { disconnectPrisma } from './db/prisma.js';
import { fabricService } from './services/fabric/fabricService.js';
import { startFabricEventIndexer, stopFabricEventIndexer } from './workers/fabricEventIndexer.js';

const app = createApp();

const server = app.listen(config.PORT, config.HOST, () => {
  console.log(`MadhuChain backend listening on http://${config.HOST}:${config.PORT}`);
  startFabricEventIndexer();
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down...`);
  stopFabricEventIndexer();
  server.close(async () => {
    await Promise.allSettled([disconnectPrisma(), fabricService.close()]);
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
