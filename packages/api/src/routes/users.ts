import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  createRelationshipSchema,
} from '../schemas/user';
import * as userService from '../services/userService';

const router = Router();

// All routes require admin access
router.use(authenticate, requireAdmin);

/**
 * GET /api/v1/users
 * List all users (admin only)
 */
router.get(
  '/',
  validateQuery(listUsersQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.listUsers({
        role: req.query.role as string | undefined,
        search: req.query.search as string | undefined,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 20,
      });

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/users
 * Create a new user (admin only)
 */
router.post(
  '/',
  validateBody(createUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/users/:id
 * Get user by ID (admin only)
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/users/:id
 * Update a user (admin only)
 */
router.put(
  '/:id',
  validateBody(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/users/:id
 * Deactivate a user (admin only)
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.deactivateUser(req.params.id);

    res.json({
      success: true,
      data: { message: 'User deactivated' },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/users/relationships
 * List all relationships (admin only)
 */
router.get(
  '/relationships',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const relationships = await userService.listRelationships();

      res.json({
        success: true,
        data: relationships,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/users/relationships
 * Create a relationship (admin only)
 */
router.post(
  '/relationships',
  validateBody(createRelationshipSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const relationship = await userService.createRelationship(req.body);

      res.status(201).json({
        success: true,
        data: relationship,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/users/relationships/:id
 * Delete a relationship (admin only)
 */
router.delete(
  '/relationships/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userService.deleteRelationship(req.params.id);

      res.json({
        success: true,
        data: { message: 'Relationship deleted' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
