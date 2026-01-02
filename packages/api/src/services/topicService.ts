import { Prisma, MeetingStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { ApiError } from '../middleware/errorHandler';
import type { CreateTopicInput, UpdateTopicInput } from '../schemas/topic';

/**
 * Topic Service
 * Handles topic (discussion item) operations
 *
 * Topics are discussion items that can be scheduled on meetings:
 * - ICs create topics for themselves
 * - Leaders create topics about specific ICs (aboutIcId = IC's user ID)
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
    throw ApiError.validation('You can only create topics about ICs you manage');
  }
}

/**
 * List topics for a user
 *
 * When includeCounterparty is true and aboutIcId is provided:
 * - Returns Leader's topics about the IC (userId = leader, aboutIcId = IC)
 * - Also returns IC's own topics (userId = IC, aboutIcId = null) marked as counterparty
 */
export async function listTopics(
  userId: string,
  options: { status?: string; labelId?: string; aboutIcId?: string; includeCounterparty?: boolean }
) {
  // Validate aboutIcId filter if provided
  if (options.aboutIcId) {
    await validateAboutIcId(userId, options.aboutIcId);
  }

  // Build base where clause for leader's own topics
  const baseWhere: Record<string, unknown> = {
    userId,
  };

  if (options.status) {
    baseWhere.status = options.status;
  }

  if (options.labelId) {
    baseWhere.labelId = options.labelId;
  }

  if (options.aboutIcId) {
    baseWhere.aboutIcId = options.aboutIcId;
  }

  const includeFields = {
    label: {
      select: {
        id: true,
        name: true,
        color: true,
      },
    },
    // Include next scheduled meeting for SCHEDULED topics
    meetingTopics: {
      where: {
        meeting: {
          status: MeetingStatus.SCHEDULED,
          scheduledAt: {
            gte: new Date(),
          },
        },
      },
      include: {
        meeting: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        meeting: {
          scheduledAt: 'asc' as const,
        },
      },
      take: 1,
    },
  };

  // Helper to transform topic with nextMeeting info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformTopic = (t: any, isCounterparty: boolean) => {
    const nextMeetingTopic = t.meetingTopics?.[0];
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      userId: t.userId,
      aboutIcId: t.aboutIcId,
      label: t.label,
      isCounterparty,
      nextMeeting: nextMeetingTopic
        ? {
            id: nextMeetingTopic.meeting.id,
            scheduledAt: nextMeetingTopic.meeting.scheduledAt,
          }
        : null,
    };
  };

  // If includeCounterparty is true and aboutIcId is provided, fetch both sets
  if (options.includeCounterparty && options.aboutIcId) {
    // Fetch leader's topics about this IC
    const leaderTopics = await prisma.topic.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'asc' },
      include: includeFields,
    });

    // Fetch IC's own DISCUSSED topics only
    // IMPORTANT: IC's BACKLOG topics remain private, SCHEDULED topics live in meeting context
    // Only DISCUSSED topics appear in the shared history view
    const counterpartyTopics = await prisma.topic.findMany({
      where: {
        userId: options.aboutIcId,
        aboutIcId: null, // IC's own topics (not about someone else)
        status: 'DISCUSSED', // Only show topics that have been discussed
      },
      orderBy: { createdAt: 'asc' },
      include: includeFields,
    });

    const markedLeaderTopics = leaderTopics.map((t) => transformTopic(t, false));
    const markedCounterpartyTopics = counterpartyTopics.map((t) => transformTopic(t, true));

    // Return combined list, leader's topics first
    return [...markedLeaderTopics, ...markedCounterpartyTopics];
  }

  // Standard query without counterparty
  const topics = await prisma.topic.findMany({
    where: baseWhere,
    orderBy: { createdAt: 'asc' },
    include: includeFields,
  });

  return topics.map((t) => transformTopic(t, false));
}

/**
 * Get topic by ID with full content and meeting associations
 */
export async function getTopicById(topicId: string, userId: string) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      label: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      meetingTopics: {
        include: {
          meeting: {
            select: {
              id: true,
              scheduledAt: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!topic) {
    throw ApiError.notFound('Topic');
  }

  // Verify ownership
  if (topic.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  return topic;
}

/**
 * Create a topic
 */
export async function createTopic(userId: string, data: CreateTopicInput) {
  // Validate aboutIcId if provided (Leaders only)
  await validateAboutIcId(userId, data.aboutIcId);

  const topic = await prisma.topic.create({
    data: {
      title: data.title,
      content: (data.content || []) as unknown as Prisma.InputJsonValue,
      userId,
      labelId: data.labelId || null,
      aboutIcId: data.aboutIcId || null,
      status: 'BACKLOG',
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

  return topic;
}

/**
 * Update a topic
 */
export async function updateTopic(
  topicId: string,
  userId: string,
  data: UpdateTopicInput
) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    throw ApiError.notFound('Topic');
  }

  if (topic.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  const updated = await prisma.topic.update({
    where: { id: topicId },
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
 * Delete a topic (only if BACKLOG status and not scheduled on any meeting)
 */
export async function deleteTopic(topicId: string, userId: string) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      meetingTopics: {
        select: { id: true },
      },
    },
  });

  if (!topic) {
    throw ApiError.notFound('Topic');
  }

  if (topic.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  if (topic.status !== 'BACKLOG') {
    throw ApiError.badRequest('TOPIC_NOT_DELETABLE', 'Can only delete topics in BACKLOG status');
  }

  // Check if topic is scheduled on any meeting
  if (topic.meetingTopics.length > 0) {
    throw ApiError.badRequest('TOPIC_SCHEDULED', 'Cannot delete topic that is scheduled on a meeting');
  }

  await prisma.topic.delete({
    where: { id: topicId },
  });
}

/**
 * Archive a topic (set status to ARCHIVED)
 */
export async function archiveTopic(topicId: string, userId: string) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    throw ApiError.notFound('Topic');
  }

  if (topic.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  const updated = await prisma.topic.update({
    where: { id: topicId },
    data: {
      status: 'ARCHIVED',
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
