import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { errorHandler, notFound } from './middleware/error.js';
import { signup, login, authMe } from './routes/auth.js';
import { hivesRouter, listHives, createHive, liveStatus, readings } from './routes/hives.js';
import { sensorData } from './routes/sensorData.js';
import {
  batchesMint,
  batchesList,
  batchesGet,
  batchesBarcode,
  serveBarcodePdf,
} from './routes/batches.js';
import {
  factoryReceived,
  factoryQualityTest,
  factoryProcessingAction,
  factoryPackaging,
  factoryBlend,
  factoryTransfer,
  factoryClearFlag,
} from './routes/factory.js';
import { verify, appearanceReport, review } from './routes/verify.js';
import { alertsList, alertsAck } from './routes/alerts.js';
import { profileGet, profilePut } from './routes/profile.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: config.ALLOWED_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(cookieParser());

  // Health
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'honeychain-backend' }));

  // Auth
  app.post('/api/auth/signup', signup);
  app.post('/api/auth/login', login);
  app.get('/api/auth/me', authMe);

  // Hives
  app.get('/api/hives', [...hivesRouter, listHives]);
  app.post('/api/hives', [...hivesRouter, createHive]);
  app.get('/api/hives/:id/live', [...hivesRouter, liveStatus]);
  app.get('/api/hives/:id/readings', [...hivesRouter, readings]);

  // Sensor ingestion (device key)
  app.post('/api/sensor-data', sensorData);

  // Batches / barcode
  app.post('/api/batches/mint', batchesMint);
  app.get('/api/batches', batchesList);
  app.get('/api/batches/:id', batchesGet);
  app.get('/api/batches/:id/barcode', batchesBarcode);
  app.get('/barcodes/:file', serveBarcodePdf);

  // Factory workflows
  app.post('/api/batches/:id/received', factoryReceived);
  app.post('/api/batches/:id/quality-test', factoryQualityTest);
  app.post('/api/batches/:id/processing-action', factoryProcessingAction);
  app.post('/api/batches/:id/packaging', factoryPackaging);
  app.post('/api/batches/:id/blend', factoryBlend);
  app.post('/api/batches/:id/transfer', factoryTransfer);
  app.post('/api/batches/:id/clear-flag', factoryClearFlag);

  // Consumer verify (public)
  app.get('/api/verify/:jarId', verify);
  app.post('/api/verify/:jarId/appearance-report', appearanceReport);
  app.post('/api/verify/:jarId/review', review);

  // Alerts / Profile
  app.get('/api/alerts', alertsList);
  app.post('/api/alerts/:id/ack', alertsAck);
  app.get('/api/profile', profileGet);
  app.put('/api/profile', profilePut);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
