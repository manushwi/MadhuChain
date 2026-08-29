import type { Request, Response, NextFunction } from 'express';

/** Restrict an endpoint to one or more roles. Must follow requireAuth(). */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole) {
      next(Object.assign(new Error('Not authenticated'), { status: 401 }));
      return;
    }
    if (!roles.includes(userRole)) {
      next(
        Object.assign(
          new Error(`Forbidden: requires role ${roles.join(' or ')}, got ${userRole}`),
          { status: 403 },
        ),
      );
      return;
    }
    next();
  };
}
