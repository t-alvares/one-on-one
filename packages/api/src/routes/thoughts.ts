import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createThoughtSchema,
  updateThoughtSchema,
  promoteThoughtSchema,
  listThoughtsQuerySchema,
  reorderThoughtsSchema,
} from '../schemas/thought';
import * as thoughtService from '../services/thoughtService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/thoughts
 * Get current user's thoughts
 */
router.get(
  '/',
  validateQuery(listThoughtsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const thoughts = await thoughtService.listThoughts(req.user!.id, {
        labelId: req.query.labelId as string | undefined,
        aboutIcId: req.query.aboutIcId as string | undefined,
      });

      res.json({
        success: true,
        data: thoughts,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/thoughts
 * Create a thought
 */
router.post(
  '/',
  validateBody(createThoughtSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const thought = await thoughtService.createThought(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        data: thought,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/thoughts/reorder
 * Reorder thoughts by providing ordered array of IDs
 * NOTE: Must be defined before /:id routes to avoid matching "reorder" as an ID
 */
router.post(
  '/reorder',
  validateBody(reorderThoughtsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await thoughtService.reorderThoughts(
        req.user!.id,
        req.body.orderedIds
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/thoughts/:id
 * Get a single thought with full content
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const thought = await thoughtService.getThoughtById(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: thought,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/thoughts/:id
 * Update a thought
 */
router.put(
  '/:id',
  validateBody(updateThoughtSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const thought = await thoughtService.updateThought(
        req.params.id,
        req.user!.id,
        req.body
      );

      res.json({
        success: true,
        data: thought,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/thoughts/:id
 * Delete a thought
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await thoughtService.deleteThought(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: { message: 'Thought deleted' },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/thoughts/:id/promote
 * Promote a thought to a topic
 */
router.post(
  '/:id/promote',
  validateBody(promoteThoughtSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await thoughtService.promoteThoughtToTopic(
        req.params.id,
        req.user!.id,
        req.body.labelId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
