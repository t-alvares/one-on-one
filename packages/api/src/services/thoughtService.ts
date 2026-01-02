import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { ApiError } from '../middleware/errorHandler';
import type { CreateThoughtInput, UpdateThoughtInput } from '../schemas/thought';

/**
 * Thought Service
 * Handles thought (scratch pad) operations
 *
 * Thoughts are private notes that users can write:
 * - ICs write thoughts for themselves (aboutIcId = null)
 * - Leaders write thoughts about specific ICs (aboutIcId = IC's user ID)
 */

/**
 * Validate that aboutIcId is a valid IC managed by the user (for Leaders)
 */
async function validateAboutIcId(userId: string, aboutIcId: string | null | undefined): Promise<void> {
  if (!aboutIcId) return;

  // Check if the user has a relationship with this IC as their leader
  const relationship = await prisma.relationship.findFirst({
    where: {
      leaderId: userId,
      icId: aboutIcId,
    },
  });

  if (!relationship) {
    throw ApiError.validation('You can only create thoughts about ICs you manage');
  }
}

/**
 * List thoughts for a user
 */
export async function listThoughts(
  userId: string,
  options: { labelId?: string; aboutIcId?: string }
) {
  // Validate aboutIcId filter if provided
  if (options.aboutIcId) {
    await validateAboutIcId(userId, options.aboutIcId);
  }

  const where: Record<string, unknown> = {
    userId,
  };

  if (options.labelId) {
    where.labelId = options.labelId;
  }

  if (options.aboutIcId) {
    where.aboutIcId = options.aboutIcId;
  }

  const thoughts = await prisma.thought.findMany({
    where,
    orderBy: [
      { order: 'asc' },
      { createdAt: 'asc' },
    ],
    select: {
      id: true,
      title: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      label: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return thoughts;
}

/**
 * Get thought by ID
 */
export async function getThoughtById(thoughtId: string, userId: string) {
  const thought = await prisma.thought.findUnique({
    where: { id: thoughtId },
    include: {
      label: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  if (!thought) {
    throw ApiError.notFound('Thought');
  }

  // Verify ownership
  if (thought.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  return thought;
}

/**
 * Create a thought
 */
export async function createThought(userId: string, data: CreateThoughtInput) {
  // Validate aboutIcId if provided (Leaders only)
  await validateAboutIcId(userId, data.aboutIcId);

  // Get the max order for this user's thoughts to append at end
  const maxOrderResult = await prisma.thought.aggregate({
    where: { userId },
    _max: { order: true },
  });
  const nextOrder = (maxOrderResult._max.order ?? -1) + 1;

  const thought = await prisma.thought.create({
    data: {
      title: data.title,
      content: (data.content || []) as unknown as Prisma.InputJsonValue,
      userId,
      labelId: data.labelId ?? null,
      aboutIcId: data.aboutIcId ?? null,
      order: nextOrder,
    },
    include: {
      label: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return thought;
}

/**
 * Update a thought
 */
export async function updateThought(
  thoughtId: string,
  userId: string,
  data: UpdateThoughtInput
) {
  const thought = await prisma.thought.findUnique({
    where: { id: thoughtId },
  });

  if (!thought) {
    throw ApiError.notFound('Thought');
  }

  if (thought.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  const updated = await prisma.thought.update({
    where: { id: thoughtId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content as unknown as Prisma.InputJsonValue }),
      ...(data.labelId !== undefined && { labelId: data.labelId }),
    },
    include: {
      label: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return updated;
}

/**
 * Delete a thought
 */
export async function deleteThought(thoughtId: string, userId: string) {
  const thought = await prisma.thought.findUnique({
    where: { id: thoughtId },
  });

  if (!thought) {
    throw ApiError.notFound('Thought');
  }

  if (thought.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  await prisma.thought.delete({
    where: { id: thoughtId },
  });
}

/**
 * Promote a thought to a topic
 */
export async function promoteThoughtToTopic(
  thoughtId: string,
  userId: string,
  labelId?: string | null
) {
  const thought = await prisma.thought.findUnique({
    where: { id: thoughtId },
  });

  if (!thought) {
    throw ApiError.notFound('Thought');
  }

  if (thought.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  // Create topic from thought - cast content appropriately
  const topic = await prisma.topic.create({
    data: {
      title: thought.title,
      content: thought.content ?? [],
      userId,
      labelId: labelId !== undefined ? labelId : thought.labelId,
      aboutIcId: thought.aboutIcId,
      status: 'BACKLOG',
    },
  });

  // Delete the original thought
  await prisma.thought.delete({
    where: { id: thoughtId },
  });

  return {
    topic: {
      id: topic.id,
      title: topic.title,
      status: topic.status,
    },
    thoughtDeleted: true,
  };
}

/**
 * Reorder thoughts
 * Updates the order of thoughts based on the provided ordered ID array
 */
export async function reorderThoughts(
  userId: string,
  orderedIds: string[]
) {
  // Verify all thoughts belong to the user
  const thoughts = await prisma.thought.findMany({
    where: {
      userId,
      id: { in: orderedIds },
    },
    select: { id: true },
  });

  if (thoughts.length !== orderedIds.length) {
    throw ApiError.validation('Invalid thought IDs provided');
  }

  // Update order for each thought in a transaction
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.thought.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  return { success: true };
}
