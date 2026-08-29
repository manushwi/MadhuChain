import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

/**
 * Authenticates the master gateway / IoT device pushing sensor readings.
 * Uses a shared static device API key (X-Device-Key header) so the node needs
 * no user account.
 */
export function requireDevice(req: Request, _res: Response, next: NextFunction): void {
  const key = req.header('x-device-key');
  if (!key || key !== config.DEVICE_API_KEY) {
    next(Object.assign(new Error('Invalid device API key'), { status: 401 }));
    return;
  }
  next();
}
