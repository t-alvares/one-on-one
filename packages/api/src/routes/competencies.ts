import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import * as labelService from '../services/labelService';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Schema for creating/updating competencies
const competencySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
});

const updateCompetencySchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
});

const reorderSchema = z.object({
  order: z.array(z.string().uuid()),
});

/**
 * GET /api/v1/competencies
 * List all competencies (available to all authenticated users)
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const competencies = await labelService.listCompetencies();

    res.json({
      success: true,
      data: competencies,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/competencies
 * Create a competency (admin only)
 */
router.post(
  '/',
  requireAdmin,
  validateBody(competencySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const competency = await labelService.createCompetency(req.body);

      res.status(201).json({
        success: true,
        data: competency,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/competencies/reorder
 * Reorder competencies (admin only)
 */
router.put(
  '/reorder',
  requireAdmin,
  validateBody(reorderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await labelService.reorderCompetencies(req.body.order);

      res.json({
        success: true,
        data: { message: 'Competencies reordered' },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/competencies/:id
 * Update a competency (admin only)
 */
router.put(
  '/:id',
  requireAdmin,
  validateBody(updateCompetencySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const competency = await labelService.updateCompetency(req.params.id, req.body);

      res.json({
        success: true,
        data: competency,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/competencies/:id
 * Delete a competency (admin only)
 */
router.delete(
  '/:id',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await labelService.deleteCompetency(req.params.id);

      res.json({
        success: true,
        data: { message: 'Competency deleted' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
