import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createActionSchema,
  updateActionSchema,
  addProgressSchema,
  listActionsQuerySchema,
} from '../schemas/action';
import * as actionService from '../services/actionService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/actions
 * Get actions with filters
 */
router.get(
  '/',
  validateQuery(listActionsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actions = await actionService.listActions(
        req.user!.id,
        req.user!.role,
        {
          ownerId: req.query.ownerId as string | undefined,
          status: req.query.status as string | undefined,
          competencyId: req.query.competencyId as string | undefined,
          relationshipId: req.query.relationshipId as string | undefined,
        }
      );

      res.json({
        success: true,
        data: actions,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/actions
 * Create an action
 */
router.post(
  '/',
  validateBody(createActionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const action = await actionService.createAction(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        data: action,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/actions/:id
 * Get action detail with progress
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const action = await actionService.getActionById(
      req.params.id,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: action,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/actions/:id
 * Update an action
 */
router.put(
  '/:id',
  validateBody(updateActionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const action = await actionService.updateAction(
        req.params.id,
        req.user!.id,
        req.user!.role,
        req.body
      );

      res.json({
        success: true,
        data: action,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/actions/:actionId/progress
 * Add a progress update
 */
router.post(
  '/:actionId/progress',
  validateBody(addProgressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const progress = await actionService.addProgress(
        req.params.actionId,
        req.user!.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
