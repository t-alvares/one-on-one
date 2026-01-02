import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireLeader } from '../middleware/auth';
import * as teamService from '../services/teamService';

const router = Router();

// All routes require leader access
router.use(authenticate, requireLeader);

/**
 * GET /api/v1/team
 * Get leader's team grouped by position type
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderId = req.user!.id;
    const teamBoard = await teamService.getTeamGroupedByPosition(leaderId);

    res.json({
      success: true,
      data: teamBoard,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/team/:icId
 * Get specific IC details
 */
router.get('/:icId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderId = req.user!.id;
    const { icId } = req.params;

    const icDetails = await teamService.getICDetails(leaderId, icId);

    if (!icDetails) {
      res.status(404).json({
        success: false,
        error: {
          code: 'IC_NOT_FOUND',
          message: 'IC not found or not in your team',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: icDetails,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/team/reorder
 * Update IC position after drag-drop
 */
router.put('/reorder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderId = req.user!.id;
    const { icId, positionType, displayOrder } = req.body;

    if (!icId || displayOrder === undefined) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'icId and displayOrder are required',
        },
      });
      return;
    }

    const success = await teamService.reorderIC(leaderId, icId, positionType ?? null, displayOrder);

    if (!success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REORDER_FAILED',
          message: 'Failed to reorder IC. IC may not be in your team or position type is invalid.',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'IC reordered successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/team/columns/reorder
 * Reorder position type columns
 */
router.put('/columns/reorder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderId = req.user!.id;
    const { columnOrder } = req.body;

    if (!Array.isArray(columnOrder)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'columnOrder must be an array of column codes',
        },
      });
      return;
    }

    const success = await teamService.reorderColumns(leaderId, columnOrder);

    if (!success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REORDER_FAILED',
          message: 'Failed to reorder columns. Some column codes may be invalid.',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Columns reordered successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/team/columns
 * Create a new position type column
 */
router.post('/columns', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderId = req.user!.id;
    const { name, code } = req.body;

    if (!name || !code) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'name and code are required',
        },
      });
      return;
    }

    // Normalize code to uppercase with underscores
    const normalizedCode = code.toUpperCase().replace(/\s+/g, '_');

    const column = await teamService.createColumn(leaderId, name, normalizedCode);

    if (!column) {
      res.status(400).json({
        success: false,
        error: {
          code: 'COLUMN_EXISTS',
          message: 'A column with this code already exists',
        },
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: column,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/team/columns/:code
 * Delete a position type column (moves ICs to unassigned)
 */
router.delete('/columns/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderId = req.user!.id;
    const { code } = req.params;

    const success = await teamService.deleteColumn(leaderId, code);

    if (!success) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COLUMN_NOT_FOUND',
          message: 'Column not found or not owned by you',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Column deleted successfully. ICs moved to unassigned.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
