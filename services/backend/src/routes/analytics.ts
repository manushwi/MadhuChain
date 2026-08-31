import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const feedbackSchema = z.object({
  outcome: z.enum(['INSPECTED_NO_ISSUE', 'ISSUE_CONFIRMED', 'SENSOR_ISSUE', 'ACTION_TAKEN', 'OTHER']),
  notes: z.string().max(2000).optional(),
  evidence_url: z.string().url().optional(),
});

async function feedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = feedbackSchema.parse(req.body);
    const prediction = await prisma.modelPrediction.findUnique({
      where: { id: req.params.id },
      include: { hive: { select: { beekeeperId: true } } },
    });
    if (!prediction) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }
    if (prediction.hive.beekeeperId !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const saved = await prisma.assessmentFeedback.create({
      data: {
        predictionId: prediction.id,
        actorId: req.user!.userId,
        outcome: body.outcome,
        notes: body.notes,
        evidenceUrl: body.evidence_url,
      },
    });
    res.status(201).json({ feedback: saved });
  } catch (error) {
    next(error);
  }
}

export const assessmentFeedback = [requireAuth, requireRole('BEEKEEPER'), feedback];
