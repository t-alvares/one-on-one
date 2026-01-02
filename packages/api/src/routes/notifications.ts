import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import * as notificationService from '../services/notificationService';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Query schema for listing notifications
const listNotificationsQuerySchema = z.object({
  unreadOnly: z.coerce.boolean().optional(),
});

/**
 * GET /api/v1/notifications
 * Get current user's notifications
 */
router.get(
  '/',
  validateQuery(listNotificationsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await notificationService.listNotifications(
        req.user!.id,
        {
          unreadOnly: req.query.unreadOnly === 'true',
        }
      );

      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/notifications/count
 * Get unread notification count
 */
router.get('/count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: { message: 'Notification marked as read' },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);

    res.json({
      success: true,
      data: { message: 'All notifications marked as read' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
