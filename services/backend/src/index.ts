import { createApp } from './app.js';
import { config } from './config.js';
import { disconnectPrisma } from './db/prisma.js';

const app = createApp();

const server = app.listen(config.PORT, config.HOST, () => {
  console.log(`✅ HoneyChain backend listening on http://${config.HOST}:${config.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
