import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createMeetingSchema,
  generateMeetingsSchema,
  updateMeetingSchema,
  addMeetingTopicSchema,
  updateMeetingTopicSchema,
  addMeetingNoteSchema,
  updateMeetingNotesSchema,
  listMeetingsQuerySchema,
} from '../schemas/meeting';
import * as meetingService from '../services/meetingService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/meetings
 * Get meetings with filters
 * Query params: ?icId=xxx (for Leaders to filter by IC)
 */
router.get(
  '/',
  validateQuery(listMeetingsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meetings = await meetingService.listMeetings(
        req.user!.id,
        req.user!.role,
        {
          icId: req.query.icId as string | undefined,
          relationshipId: req.query.relationshipId as string | undefined,
          status: req.query.status as string | undefined,
          upcoming: req.query.upcoming === 'true' ? true : req.query.upcoming === 'false' ? false : undefined,
        }
      );

      res.json({
        success: true,
        data: meetings,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/meetings
 * Create a single meeting (Leader only)
 * Body: { icId, scheduledAt, title? }
 */
router.post(
  '/',
  validateBody(createMeetingSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only Leaders can create meetings
      if (req.user!.role !== 'LEADER') {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only Leaders can create meetings' },
        });
        return;
      }

      const meeting = await meetingService.createMeeting(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        data: meeting,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/meetings/generate
 * Generate recurring meetings (Leader only)
 * Body: { icId, frequency, dayOfWeek, time, count }
 */
router.post(
  '/generate',
  validateBody(generateMeetingsSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only Leaders can generate meetings
      if (req.user!.role !== 'LEADER') {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only Leaders can generate meetings' },
        });
        return;
      }

      const meetings = await meetingService.generateRecurringMeetings(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        data: meetings,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/meetings/:id
 * Get meeting detail with topics
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meeting = await meetingService.getMeetingById(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/meetings/:id
 * Update meeting (reschedule, rename)
 */
router.put(
  '/:id',
  validateBody(updateMeetingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.updateMeeting(
        req.params.id,
        req.user!.id,
        req.body
      );

      res.json({
        success: true,
        data: meeting,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/meetings/:id
 * Delete meeting (Leader only)
 * Only allowed if: status is SCHEDULED AND no topics added
 */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await meetingService.deleteMeeting(req.params.id, req.user!.id);

      res.json({
        success: true,
        data: { message: 'Meeting deleted' },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/meetings/:id/complete
 * Mark meeting as complete
 */
router.post(
  '/:id/complete',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await meetingService.completeMeeting(req.params.id, req.user!.id);

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
 * POST /api/v1/meetings/:meetingId/topics
 * Add a topic to a meeting
 */
router.post(
  '/:meetingId/topics',
  validateBody(addMeetingTopicSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meetingTopic = await meetingService.addTopicToMeeting(
        req.params.meetingId,
        req.user!.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: meetingTopic,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/meetings/:meetingId/topics/:meetingTopicId
 * Update meeting topic (reorder, resolve)
 */
router.put(
  '/:meetingId/topics/:meetingTopicId',
  validateBody(updateMeetingTopicSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meetingTopic = await meetingService.updateMeetingTopic(
        req.params.meetingId,
        req.params.meetingTopicId,
        req.user!.id,
        req.body
      );

      res.json({
        success: true,
        data: meetingTopic,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/meetings/:id/topics/:topicId
 * Remove a topic from a meeting (by topicId)
 * Verify: user added this topic OR user is the Leader (creator)
 */
router.delete(
  '/:id/topics/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await meetingService.removeTopicFromMeetingByTopicId(
        req.params.id,
        req.params.topicId,
        req.user!.id
      );

      res.json({
        success: true,
        data: { message: 'Topic removed from meeting' },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/meetings/:meetingId/notes
 * Add a note to a meeting
 */
router.post(
  '/:meetingId/notes',
  validateBody(addMeetingNoteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await meetingService.addMeetingNote(
        req.params.meetingId,
        req.user!.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/meetings/:id/notes
 * Get the shared meeting notes document
 */
router.get('/:id/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await meetingService.getMeetingNotes(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/meetings/:id/notes
 * Update (upsert) the shared meeting notes document
 */
router.put(
  '/:id/notes',
  validateBody(updateMeetingNotesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notes = await meetingService.updateMeetingNotes(
        req.params.id,
        req.user!.id,
        req.body
      );

      res.json({
        success: true,
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
