import prisma from '../lib/prisma';
import { ApiError } from '../middleware/errorHandler';
import type { CreateActionInput, UpdateActionInput, AddProgressInput } from '../schemas/action';

/**
 * Action Service
 * Handles action/task operations
 */

/**
 * List actions with filters
 */
export async function listActions(
  userId: string,
  userRole: string,
  options: {
    ownerId?: string;
    status?: string;
    competencyId?: string;
    relationshipId?: string;
  }
) {
  const where: Record<string, unknown> = {};

  if (options.ownerId) {
    where.ownerId = options.ownerId;
  }

  if (options.status) {
    where.status = options.status;
  }

  if (options.competencyId) {
    where.competencyId = options.competencyId;
  }

  // For ICs, only show their own actions
  if (userRole === 'IC') {
    where.ownerId = userId;
  }

  // Filter by relationship for leaders
  if (options.relationshipId && userRole === 'LEADER') {
    const relationship = await prisma.relationship.findUnique({
      where: { id: options.relationshipId },
    });
    if (relationship) {
      where.ownerId = relationship.icId;
    }
  }

  const actions = await prisma.action.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
      competency: { select: { id: true, name: true } },
      meeting: { select: { id: true, scheduledAt: true } },
      _count: { select: { progressUpdates: true } },
    },
  });

  return actions.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    owner: a.owner,
    creator: a.creator,
    competency: a.competency,
    status: a.status,
    dueDate: a.dueDate,
    meeting: a.meeting,
    progressCount: a._count.progressUpdates,
    createdAt: a.createdAt,
  }));
}

/**
 * Get action by ID with progress
 */
export async function getActionById(actionId: string, userId: string, userRole: string) {
  const action = await prisma.action.findUnique({
    where: { id: actionId },
    include: {
      owner: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
      competency: { select: { id: true, name: true } },
      meeting: { select: { id: true, scheduledAt: true, title: true } },
      meetingTopic: {
        include: {
          topic: { select: { id: true, title: true } },
        },
      },
      progressUpdates: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!action) {
    throw ApiError.notFound('Action');
  }

  // ICs can only see their own actions
  if (userRole === 'IC' && action.ownerId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  return {
    ...action,
    topic: action.meetingTopic?.topic || null,
    progress: action.progressUpdates,
  };
}

/**
 * Create an action
 */
export async function createAction(userId: string, data: CreateActionInput) {
  // Verify owner exists
  const owner = await prisma.user.findUnique({
    where: { id: data.ownerId },
  });

  if (!owner) {
    throw ApiError.notFound('Owner');
  }

  const action = await prisma.action.create({
    data: {
      title: data.title,
      description: data.description ? [{ type: 'paragraph', content: [{ type: 'text', text: data.description }] }] : [],
      ownerId: data.ownerId,
      creatorId: userId,
      competencyId: data.competencyId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      meetingId: data.meetingId || null,
      meetingTopicId: data.meetingTopicId || null,
      status: 'NOT_STARTED',
    },
    include: {
      owner: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
      competency: { select: { id: true, name: true } },
    },
  });

  return action;
}

/**
 * Update an action
 */
export async function updateAction(
  actionId: string,
  userId: string,
  userRole: string,
  data: UpdateActionInput
) {
  const action = await prisma.action.findUnique({
    where: { id: actionId },
  });

  if (!action) {
    throw ApiError.notFound('Action');
  }

  // ICs can only update their own actions
  if (userRole === 'IC' && action.ownerId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  // Map our schema status to Prisma's ActionStatus
  const statusMap: Record<string, 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED'> = {
    PENDING: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  };

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.description !== undefined) {
    updateData.description = data.description ? [{ type: 'paragraph', content: [{ type: 'text', text: data.description }] }] : [];
  }
  if (data.status !== undefined) {
    updateData.status = statusMap[data.status] || data.status;
  }
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  if (data.competencyId !== undefined) {
    updateData.competencyId = data.competencyId;
  }

  const updated = await prisma.action.update({
    where: { id: actionId },
    data: updateData,
    include: {
      owner: { select: { id: true, name: true } },
      competency: { select: { id: true, name: true } },
    },
  });

  return updated;
}

/**
 * Add progress update to action
 */
export async function addProgress(
  actionId: string,
  userId: string,
  data: AddProgressInput
) {
  const action = await prisma.action.findUnique({
    where: { id: actionId },
  });

  if (!action) {
    throw ApiError.notFound('Action');
  }

  const progress = await prisma.progressUpdate.create({
    data: {
      actionId,
      authorId: userId,
      content: data.content,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return progress;
}
