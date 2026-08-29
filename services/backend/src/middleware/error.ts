import type { Request, Response, NextFunction } from 'express';

type HttpError = Error & { status?: number };

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) {
    console.error('Unhandled error:', err);
  }
  res.status(status).json({ error: err.message || 'Internal server error', status });
}
