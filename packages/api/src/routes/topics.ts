import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createTopicSchema,
  updateTopicSchema,
  listTopicsQuerySchema,
} from '../schemas/topic';
import * as topicService from '../services/topicService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/topics
 * Get current user's topics
 *
 * Query params:
 * - status: Filter by topic status
 * - labelId: Filter by label
 * - aboutIcId: Filter by IC (for Leaders)
 * - includeCounterparty: If 'true', also include IC's own topics (for Leaders viewing IC workspace)
 */
router.get(
  '/',
  validateQuery(listTopicsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topics = await topicService.listTopics(req.user!.id, {
        status: req.query.status as string | undefined,
        labelId: req.query.labelId as string | undefined,
        aboutIcId: req.query.aboutIcId as string | undefined,
        includeCounterparty: req.query.includeCounterparty === 'true',
      });

      res.json({
        success: true,
        data: topics,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/topics
 * Create a topic
 */
router.post(
  '/',
  validateBody(createTopicSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topic = await topicService.createTopic(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/topics/:id
 * Get a single topic with full content
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = await topicService.getTopicById(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/topics/:id
 * Update a topic
 */
router.put(
  '/:id',
  validateBody(updateTopicSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topic = await topicService.updateTopic(
        req.params.id,
        req.user!.id,
        req.body
      );

      res.json({
        success: true,
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/topics/:id
 * Delete a topic (only if BACKLOG status and not scheduled on any meeting)
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await topicService.deleteTopic(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: { message: 'Topic deleted' },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/topics/:id/archive
 * Archive a topic (set status to ARCHIVED)
 */
router.post('/:id/archive', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = await topicService.archiveTopic(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
