import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import * as labelService from '../services/labelService';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Schema for creating/updating labels
const labelSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
});

const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
});

/**
 * GET /api/v1/labels
 * List all labels (available to all authenticated users)
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const labels = await labelService.listLabels();

    res.json({
      success: true,
      data: labels,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/labels
 * Create a label (admin only)
 */
router.post(
  '/',
  requireAdmin,
  validateBody(labelSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const label = await labelService.createLabel(req.body);

      res.status(201).json({
        success: true,
        data: label,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/labels/:id
 * Update a label (admin only)
 */
router.put(
  '/:id',
  requireAdmin,
  validateBody(updateLabelSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const label = await labelService.updateLabel(req.params.id, req.body);

      res.json({
        success: true,
        data: label,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/labels/:id
 * Delete a label (admin only)
 * Query params:
 *   - force: boolean - If true, removes label from all thoughts/topics before deletion
 */
router.delete(
  '/:id',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const force = req.query.force === 'true';
      await labelService.deleteLabel(req.params.id, force);

      res.json({
        success: true,
        data: { message: 'Label deleted' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
