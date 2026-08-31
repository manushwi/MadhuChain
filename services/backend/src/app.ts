import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { errorHandler, notFound } from './middleware/error.js';
import { signup, login, authMe, adminRegisterHandler } from './routes/auth.js';
import { hivesRouter, listHives, createHive, liveStatus, readings, assessment, hiveAnalysis } from './routes/hives.js';
import { sensorData } from './routes/sensorData.js';
import {
  batchesMint,
  batchesList,
  batchesGet,
  batchesBarcode,
  serveBarcodePdf,
  serveQrPng,
} from './routes/batches.js';
import {
  factoryReceived,
  factoryQualityTest,
  factoryProcessingAction,
  factoryPackaging,
  factoryBlend,
  factoryTransfer,
  factoryClearFlag,
  factoryScan,
  factoryListOperators,
} from './routes/factory.js';
import { verify, appearanceReport, review } from './routes/verify.js';
import { alertsList, alertsAck, alertsResolve } from './routes/alerts.js';
import { profileGet, profilePut } from './routes/profile.js';
import { assessmentFeedback } from './routes/analytics.js';
import {
  adminAlertUpdate, adminAlerts, adminAudit, adminBeekeepers, adminFabricEvent, adminFabricEvents,
  adminFabricEventVerify, adminFabricStatus, adminHives, adminOrganizationCreate, adminOrganizations,
  adminOrganizationUpdate, adminOverview, adminUserCreate, adminUsers, adminUserUpdate, adminReassessHives,
} from './routes/admin.js';

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
  app.post('/api/auth/admin-register', adminRegisterHandler);

  // Hives
  app.get('/api/hives', [...hivesRouter, listHives]);
  app.post('/api/hives', [...hivesRouter, createHive]);
  app.get('/api/hives/:id/live', [...hivesRouter, liveStatus]);
  app.get('/api/hives/:id/readings', [...hivesRouter, readings]);
  app.get('/api/hives/:id/assessment', [...hivesRouter, assessment]);
  app.get('/api/hives/:id/analysis', [...hivesRouter, hiveAnalysis]);

  // Sensor ingestion (device key)
  app.post('/api/sensor-data', sensorData);

  // Batches / barcode
  app.post('/api/batches/mint', batchesMint);
  app.get('/api/batches', batchesList);
  app.get('/api/batches/:id', batchesGet);
  app.get('/api/batches/:id/barcode', batchesBarcode);
  app.get('/barcodes/:file', serveBarcodePdf);
  app.get('/qr/:file.png', serveQrPng);

  // Factory workflows
  app.post('/api/factory/scan', factoryScan);
  app.get('/api/factory/operators', factoryListOperators);
  app.post('/api/batches/:id/received', factoryReceived);
  app.post('/api/batches/:id/quality-test', factoryQualityTest);
  app.post('/api/batches/:id/processing-action', factoryProcessingAction);
  app.post('/api/batches/:id/packaging', factoryPackaging);
  app.post('/api/batches/:id/blend', factoryBlend);
  app.post('/api/batches/:id/transfer', factoryTransfer);
  app.post('/api/batches/:id/clear-flag', factoryClearFlag);

  // Consumer verify (public)
  app.get('/api/verify/token/:token', verify);
  app.get('/api/verify/:jarId', verify);
  app.post('/api/verify/:jarId/appearance-report', appearanceReport);
  app.post('/api/verify/:jarId/review', review);

  // Alerts / Profile
  app.get('/api/alerts', alertsList);
  app.post('/api/alerts/:id/ack', alertsAck);
  app.post('/api/alerts/:id/resolve', alertsResolve);
  app.get('/api/profile', profileGet);
  app.put('/api/profile', profilePut);
  app.post('/api/assessments/:id/feedback', assessmentFeedback);

  // KVIC administration and indexed ledger proof APIs.
  app.get('/api/admin/overview', adminOverview);
  app.get('/api/admin/organizations', adminOrganizations);
  app.post('/api/admin/organizations', adminOrganizationCreate);
  app.patch('/api/admin/organizations/:id', adminOrganizationUpdate);
  app.get('/api/admin/users', adminUsers);
  app.post('/api/admin/users', adminUserCreate);
  app.patch('/api/admin/users/:id', adminUserUpdate);
  app.get('/api/admin/beekeepers', adminBeekeepers);
  app.get('/api/admin/hives', adminHives);
  app.post('/api/admin/hives/reassess', adminReassessHives);
  app.get('/api/admin/alerts', adminAlerts);
  app.patch('/api/admin/alerts/:id', adminAlertUpdate);
  app.get('/api/admin/fabric/events', adminFabricEvents);
  app.get('/api/admin/fabric/events/:transactionId', adminFabricEvent);
  app.post('/api/admin/fabric/events/:transactionId/verify', adminFabricEventVerify);
  app.get('/api/admin/fabric/status', adminFabricStatus);
  app.get('/api/admin/audit', adminAudit);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
