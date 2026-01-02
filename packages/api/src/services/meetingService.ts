import prisma from '../lib/prisma';
import { ApiError } from '../middleware/errorHandler';
import type {
  CreateMeetingInput,
  GenerateMeetingsInput,
  UpdateMeetingInput,
  AddMeetingTopicInput,
  UpdateMeetingTopicInput,
  AddMeetingNoteInput,
  UpdateMeetingNotesInput,
} from '../schemas/meeting';

/**
 * Meeting Service
 * Handles meeting operations
 */

// Default meeting duration in minutes (for conflict detection)
const DEFAULT_MEETING_DURATION_MINUTES = 60;

/**
 * Validate that a meeting time is in the future
 * @param scheduledAt - The proposed meeting time
 * @param minimumLeadMinutes - Minimum minutes from now (default: 5 minutes)
 */
function validateMeetingTimeNotInPast(scheduledAt: Date, minimumLeadMinutes = 5): void {
  const now = new Date();
  const minimumTime = new Date(now.getTime() + minimumLeadMinutes * 60 * 1000);

  if (scheduledAt < minimumTime) {
    throw ApiError.badRequest(
      'MEETING_IN_PAST',
      'Meeting must be scheduled at least 5 minutes in the future'
    );
  }
}

/**
 * Check for conflicting meetings for a leader
 * A conflict exists if the new meeting overlaps with an existing one
 * @param leaderId - The leader's user ID
 * @param scheduledAt - The proposed meeting time
 * @param excludeMeetingId - Optional meeting ID to exclude (for updates)
 * @returns The conflicting meeting if found, null otherwise
 */
async function checkMeetingConflict(
  leaderId: string,
  scheduledAt: Date,
  excludeMeetingId?: string
): Promise<{ icName: string; scheduledAt: Date } | null> {
  // Calculate time window for conflict check
  const meetingStart = scheduledAt;
  const meetingEnd = new Date(scheduledAt.getTime() + DEFAULT_MEETING_DURATION_MINUTES * 60 * 1000);

  // Find any meetings that overlap
  // A meeting conflicts if:
  // - Its start time is within our meeting window, OR
  // - Our start time is within its meeting window
  const conflictingMeeting = await prisma.meeting.findFirst({
    where: {
      createdById: leaderId,
      status: 'SCHEDULED',
      ...(excludeMeetingId && { id: { not: excludeMeetingId } }),
      // Check for overlap: existing meeting starts before our end AND ends after our start
      AND: [
        {
          scheduledAt: {
            lt: meetingEnd,
          },
        },
        {
          scheduledAt: {
            gte: new Date(meetingStart.getTime() - DEFAULT_MEETING_DURATION_MINUTES * 60 * 1000),
          },
        },
      ],
    },
    include: {
      relationship: {
        include: {
          ic: { select: { name: true } },
        },
      },
    },
  });

  if (conflictingMeeting) {
    return {
      icName: conflictingMeeting.relationship.ic.name,
      scheduledAt: conflictingMeeting.scheduledAt,
    };
  }

  return null;
}

/**
 * List meetings with filters
 * Returns meetings separated into upcoming and past arrays
 */
export async function listMeetings(
  userId: string,
  userRole: string,
  options: { icId?: string; relationshipId?: string; status?: string; upcoming?: boolean }
) {
  const where: Record<string, unknown> = {};

  // For Leaders: filter by icId if provided
  if (userRole === 'LEADER' && options.icId) {
    // Find relationship with this IC
    const relationship = await prisma.relationship.findFirst({
      where: {
        leaderId: userId,
        icId: options.icId,
      },
    });
    if (relationship) {
      where.relationshipId = relationship.id;
    } else {
      // No relationship found, return empty
      return { upcoming: [], past: [] };
    }
  } else if (userRole === 'LEADER' && !options.icId && !options.relationshipId) {
    // Leaders see all their meetings (created by them)
    where.createdById = userId;
  } else if (options.relationshipId) {
    // Filter by specific relationship
    where.relationshipId = options.relationshipId;
  } else if (userRole === 'IC') {
    // ICs see meetings where they are the IC
    const relationship = await prisma.relationship.findUnique({
      where: { icId: userId },
    });
    if (relationship) {
      where.relationshipId = relationship.id;
    } else {
      return { upcoming: [], past: [] };
    }
  }

  if (options.status) {
    where.status = options.status;
  }

  // If explicitly filtering by upcoming/past, apply the filter
  if (options.upcoming !== undefined) {
    const now = new Date();
    where.scheduledAt = options.upcoming ? { gte: now } : { lt: now };
  }

  const meetings = await prisma.meeting.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
    include: {
      relationship: {
        include: {
          leader: { select: { id: true, name: true } },
          ic: { select: { id: true, name: true } },
        },
      },
      createdBy: { select: { id: true, name: true } },
      topics: {
        include: {
          topic: {
            select: { userId: true },
          },
        },
      },
    },
  });

  const now = new Date();

  const mappedMeetings = meetings.map((m) => {
    const icId = m.relationship.icId;
    const leaderId = m.relationship.leaderId;

    // Count topics by owner
    const icTopicCount = m.topics.filter((mt) => mt.topic.userId === icId).length;
    const leaderTopicCount = m.topics.filter((mt) => mt.topic.userId === leaderId).length;

    return {
      id: m.id,
      scheduledAt: m.scheduledAt,
      title: m.title,
      status: m.status,
      topicCount: m.topics.length,
      createdBy: m.createdBy,
      relationship: {
        id: m.relationship.id,
        leader: m.relationship.leader,
        ic: m.relationship.ic,
      },
      topicCounts: {
        ic: icTopicCount,
        leader: leaderTopicCount,
      },
    };
  });

  // Separate into upcoming and past
  const upcoming = mappedMeetings.filter((m) => new Date(m.scheduledAt) >= now);
  const past = mappedMeetings.filter((m) => new Date(m.scheduledAt) < now);

  // Find the next meeting (first upcoming)
  const nextMeeting = upcoming.length > 0 ? upcoming[0] : null;

  return {
    upcoming: upcoming.map((m) => ({
      ...m,
      isNext: nextMeeting?.id === m.id,
    })),
    past: past.reverse(), // Most recent past first
  };
}

/**
 * Get meeting by ID with full details
 */
export async function getMeetingById(meetingId: string, userId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      relationship: {
        include: {
          leader: { select: { id: true, name: true } },
          ic: { select: { id: true, name: true } },
        },
      },
      createdBy: { select: { id: true, name: true } },
      topics: {
        orderBy: { order: 'asc' },
        include: {
          topic: {
            include: {
              label: { select: { id: true, name: true, color: true } },
            },
          },
          addedBy: { select: { id: true, name: true } },
        },
      },
      notes: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true } },
        },
      },
      actions: {
        include: {
          owner: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!meeting) {
    throw ApiError.notFound('Meeting');
  }

  // Verify user has access (is leader or IC in the relationship)
  const { relationship } = meeting;
  if (relationship.leaderId !== userId && relationship.icId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  return {
    id: meeting.id,
    scheduledAt: meeting.scheduledAt,
    title: meeting.title,
    status: meeting.status,
    createdBy: meeting.createdBy,
    relationship: {
      id: relationship.id,
      leader: relationship.leader,
      ic: relationship.ic,
    },
    topics: meeting.topics.map((mt) => ({
      id: mt.topic.id,
      meetingTopicId: mt.id,
      title: mt.topic.title,
      label: mt.topic.label,
      addedBy: {
        ...mt.addedBy,
        isCurrentUser: mt.addedById === userId,
      },
      resolution: mt.resolution,
      order: mt.order,
    })),
    notes: meeting.notes.map((n) => ({
      id: n.id,
      content: n.content,
      author: n.author,
      createdAt: n.createdAt,
    })),
    actions: meeting.actions,
  };
}

/**
 * Create a meeting (Leader only)
 */
export async function createMeeting(userId: string, data: CreateMeetingInput) {
  const scheduledAt = new Date(data.scheduledAt);

  // Validate meeting time is not in the past
  validateMeetingTimeNotInPast(scheduledAt);

  // Find relationship between leader and IC
  const relationship = await prisma.relationship.findFirst({
    where: {
      leaderId: userId,
      icId: data.icId,
    },
    include: {
      ic: { select: { id: true, name: true } },
    },
  });

  if (!relationship) {
    throw ApiError.notFound('Relationship with this IC');
  }

  // Check for conflicting meetings
  const conflict = await checkMeetingConflict(userId, scheduledAt);
  if (conflict) {
    const conflictTime = new Date(conflict.scheduledAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    throw ApiError.badRequest(
      'MEETING_CONFLICT',
      `You already have a meeting with ${conflict.icName} at ${conflictTime} on this day`
    );
  }

  // Generate default title if not provided
  const title = data.title || `1:1 with ${relationship.ic.name}`;

  const meeting = await prisma.meeting.create({
    data: {
      relationshipId: relationship.id,
      createdById: userId,
      scheduledAt: new Date(data.scheduledAt),
      title,
      status: 'SCHEDULED',
    },
    include: {
      relationship: {
        include: {
          leader: { select: { id: true, name: true } },
          ic: { select: { id: true, name: true } },
        },
      },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return meeting;
}

/**
 * Generate recurring meetings (Leader only)
 */
export async function generateRecurringMeetings(userId: string, data: GenerateMeetingsInput) {
  // Find relationship between leader and IC
  const relationship = await prisma.relationship.findFirst({
    where: {
      leaderId: userId,
      icId: data.icId,
    },
    include: {
      ic: { select: { id: true, name: true } },
    },
  });

  if (!relationship) {
    throw ApiError.notFound('Relationship with this IC');
  }

  // Calculate meeting dates
  const meetingDates: Date[] = [];
  const [hours, minutes] = data.time.split(':').map(Number);

  // Find the next occurrence of the specified day of week
  let nextDate = new Date();
  nextDate.setHours(hours, minutes, 0, 0);

  // Move to next occurrence of the target day
  const currentDay = nextDate.getDay();
  let daysUntilTarget = data.dayOfWeek - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7; // Move to next week if today or past
  }
  nextDate.setDate(nextDate.getDate() + daysUntilTarget);

  // Calculate interval based on frequency
  const intervalDays = data.frequency === 'WEEKLY' ? 7 : 14;

  // Generate meeting dates
  for (let i = 0; i < data.count; i++) {
    meetingDates.push(new Date(nextDate));
    nextDate.setDate(nextDate.getDate() + intervalDays);
  }

  // Validate first meeting is in the future (all others will be too)
  if (meetingDates.length > 0) {
    validateMeetingTimeNotInPast(meetingDates[0]);
  }

  // Check for conflicts with existing meetings
  const conflicts: string[] = [];
  for (const scheduledAt of meetingDates) {
    const conflict = await checkMeetingConflict(userId, scheduledAt);
    if (conflict) {
      const conflictDate = scheduledAt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const conflictTime = new Date(conflict.scheduledAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      conflicts.push(`${conflictDate}: conflict with ${conflict.icName} at ${conflictTime}`);
    }
  }

  if (conflicts.length > 0) {
    throw ApiError.badRequest(
      'MEETING_CONFLICTS',
      `Cannot generate meetings due to conflicts:\n${conflicts.join('\n')}`
    );
  }

  // Default title
  const title = `1:1 with ${relationship.ic.name}`;

  // Create all meetings in a transaction
  const createdMeetings = await prisma.$transaction(
    meetingDates.map((scheduledAt) =>
      prisma.meeting.create({
        data: {
          relationshipId: relationship.id,
          createdById: userId,
          scheduledAt,
          title,
          status: 'SCHEDULED',
        },
        include: {
          relationship: {
            include: {
              leader: { select: { id: true, name: true } },
              ic: { select: { id: true, name: true } },
            },
          },
          createdBy: { select: { id: true, name: true } },
        },
      })
    )
  );

  return createdMeetings;
}

/**
 * Delete a meeting (Leader only)
 * Only allowed if: status is SCHEDULED AND no topics added
 */
export async function deleteMeeting(meetingId: string, userId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      relationship: true,
      _count: { select: { topics: true } },
    },
  });

  if (!meeting) {
    throw ApiError.notFound('Meeting');
  }

  // Verify caller is the creator
  if (meeting.createdById !== userId) {
    throw ApiError.forbidden('Only the meeting creator can delete meetings');
  }

  // Check if meeting has topics
  if (meeting._count.topics > 0) {
    throw ApiError.badRequest(
      'MEETING_HAS_TOPICS',
      'Cannot delete meeting with topics. Remove all topics first.'
    );
  }

  // Check if meeting is scheduled
  if (meeting.status !== 'SCHEDULED') {
    throw ApiError.badRequest(
      'MEETING_NOT_SCHEDULED',
      'Only scheduled meetings can be deleted'
    );
  }

  await prisma.meeting.delete({
    where: { id: meetingId },
  });

  return { deleted: true };
}

/**
 * Update a meeting
 */
export async function updateMeeting(
  meetingId: string,
  userId: string,
  data: UpdateMeetingInput
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { relationship: true },
  });

  if (!meeting) {
    throw ApiError.notFound('Meeting');
  }

  // Verify caller is the creator
  if (meeting.createdById !== userId) {
    throw ApiError.forbidden('Only the meeting creator can update meetings');
  }

  if (meeting.status === 'COMPLETED') {
    throw ApiError.badRequest('MEETING_COMPLETED', 'Cannot modify completed meeting');
  }

  // If rescheduling, validate the new time
  if (data.scheduledAt) {
    const newScheduledAt = new Date(data.scheduledAt);

    // Validate meeting time is not in the past
    validateMeetingTimeNotInPast(newScheduledAt);

    // Check for conflicting meetings (excluding this meeting)
    const conflict = await checkMeetingConflict(userId, newScheduledAt, meetingId);
    if (conflict) {
      const conflictTime = new Date(conflict.scheduledAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      throw ApiError.badRequest(
        'MEETING_CONFLICT',
        `You already have a meeting with ${conflict.icName} at ${conflictTime} on this day`
      );
    }
  }

  const updated = await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
      ...(data.title && { title: data.title }),
    },
    include: {
      relationship: {
        include: {
          leader: { select: { id: true, name: true } },
          ic: { select: { id: true, name: true } },
        },
      },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return updated;
}

/**
 * Mark meeting as complete
 */
export async function completeMeeting(meetingId: string, userId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      relationship: true,
      topics: true,
    },
  });

  if (!meeting) {
    throw ApiError.notFound('Meeting');
  }

  // Verify caller is the creator
  if (meeting.createdById !== userId) {
    throw ApiError.forbidden('Only the meeting creator can complete meetings');
  }

  // Update meeting status
  await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: 'COMPLETED' },
  });

  // Update all associated topics to DISCUSSED
  const topicIds = meeting.topics.map((t) => t.topicId);
  if (topicIds.length > 0) {
    await prisma.topic.updateMany({
      where: { id: { in: topicIds } },
      data: { status: 'DISCUSSED' },
    });
  }

  const unresolvedTopics = meeting.topics.filter((t) => !t.resolution).length;

  return {
    id: meetingId,
    status: 'COMPLETED',
    unresolvedTopics,
  };
}

/**
 * Add topic to meeting
 */
export async function addTopicToMeeting(
  meetingId: string,
  userId: string,
  data: AddMeetingTopicInput
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      relationship: true,
      topics: { orderBy: { order: 'desc' }, take: 1 },
    },
  });

  if (!meeting) {
    throw ApiError.notFound('Meeting');
  }

  // Verify user is part of the relationship
  if (meeting.relationship.leaderId !== userId && meeting.relationship.icId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  if (meeting.status === 'COMPLETED') {
    throw ApiError.badRequest('MEETING_COMPLETED', 'Cannot modify completed meeting');
  }

  // Verify topic exists and belongs to user
  const topic = await prisma.topic.findUnique({
    where: { id: data.topicId },
  });

  if (!topic) {
    throw ApiError.notFound('Topic');
  }

  if (topic.userId !== userId) {
    throw ApiError.forbidden('Cannot add topics owned by others');
  }

  // Check if topic is already on this meeting
  const existing = await prisma.meetingTopic.findFirst({
    where: {
      meetingId,
      topicId: data.topicId,
    },
  });

  if (existing) {
    throw ApiError.badRequest('TOPIC_ALREADY_SCHEDULED', 'Topic is already on this meeting');
  }

  const nextOrder = (meeting.topics[0]?.order ?? -1) + 1;

  const meetingTopic = await prisma.meetingTopic.create({
    data: {
      meetingId,
      topicId: data.topicId,
      addedById: userId,
      order: nextOrder,
    },
    include: {
      topic: {
        include: {
          label: { select: { id: true, name: true, color: true } },
        },
      },
    },
  });

  // Update topic status to SCHEDULED
  await prisma.topic.update({
    where: { id: data.topicId },
    data: { status: 'SCHEDULED' },
  });

  return meetingTopic;
}

/**
 * Update meeting topic (reorder, resolve)
 */
export async function updateMeetingTopic(
  meetingId: string,
  meetingTopicId: string,
  userId: string,
  data: UpdateMeetingTopicInput
) {
  const meetingTopic = await prisma.meetingTopic.findUnique({
    where: { id: meetingTopicId },
    include: {
      meeting: {
        include: { relationship: true },
      },
    },
  });

  if (!meetingTopic || meetingTopic.meetingId !== meetingId) {
    throw ApiError.notFound('Meeting topic');
  }

  const { meeting } = meetingTopic;
  if (meeting.relationship.leaderId !== userId && meeting.relationship.icId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  // Build update data carefully to match Prisma types
  const updateData: { order?: number; resolution?: 'DONE' | 'NEXT' | 'BACKLOG' | 'ACTION' | null } = {};

  if (data.order !== undefined) {
    updateData.order = data.order;
  }

  if (data.resolution !== undefined) {
    // Map our schema enum to Prisma's enum
    const resolutionMap: Record<string, 'DONE' | 'NEXT' | 'BACKLOG' | 'ACTION'> = {
      DONE: 'DONE',
      DEFERRED: 'NEXT',
      DROPPED: 'BACKLOG',
    };
    updateData.resolution = data.resolution ? resolutionMap[data.resolution] || null : null;
  }

  const updated = await prisma.meetingTopic.update({
    where: { id: meetingTopicId },
    data: updateData,
  });

  return updated;
}

/**
 * Remove topic from meeting by meetingTopicId
 */
export async function removeTopicFromMeeting(
  meetingId: string,
  meetingTopicId: string,
  userId: string
) {
  const meetingTopic = await prisma.meetingTopic.findUnique({
    where: { id: meetingTopicId },
    include: {
      meeting: {
        include: { relationship: true },
      },
    },
  });

  if (!meetingTopic || meetingTopic.meetingId !== meetingId) {
    throw ApiError.notFound('Meeting topic');
  }

  const { meeting } = meetingTopic;

  // Verify: user added this topic OR user is the Leader (creator)
  const isTopicAdder = meetingTopic.addedById === userId;
  const isLeader = meeting.createdById === userId;

  if (!isTopicAdder && !isLeader) {
    throw ApiError.forbidden('Only the topic adder or meeting creator can remove topics');
  }

  await prisma.meetingTopic.delete({
    where: { id: meetingTopicId },
  });

  // Check if topic is on any other meetings
  const otherMeetings = await prisma.meetingTopic.findFirst({
    where: { topicId: meetingTopic.topicId },
  });

  // If not on any other meetings, revert to BACKLOG
  if (!otherMeetings) {
    await prisma.topic.update({
      where: { id: meetingTopic.topicId },
      data: { status: 'BACKLOG' },
    });
  }
}

/**
 * Remove topic from meeting by topicId (finds MeetingTopic by meetingId + topicId)
 */
export async function removeTopicFromMeetingByTopicId(
  meetingId: string,
  topicId: string,
  userId: string
) {
  const meetingTopic = await prisma.meetingTopic.findUnique({
    where: {
      meetingId_topicId: {
        meetingId,
        topicId,
      },
    },
    include: {
      meeting: {
        include: { relationship: true },
      },
    },
  });

  if (!meetingTopic) {
    throw ApiError.notFound('Topic not found on this meeting');
  }

  const { meeting } = meetingTopic;

  // Verify: user added this topic OR user is the Leader (creator)
  const isTopicAdder = meetingTopic.addedById === userId;
  const isLeader = meeting.createdById === userId;

  if (!isTopicAdder && !isLeader) {
    throw ApiError.forbidden('Only the topic adder or meeting creator can remove topics');
  }

  await prisma.meetingTopic.delete({
    where: { id: meetingTopic.id },
  });

  // Check if topic is on any other meetings
  const otherMeetings = await prisma.meetingTopic.findFirst({
    where: { topicId },
  });

  // If not on any other meetings, revert to BACKLOG
  if (!otherMeetings) {
    await prisma.topic.update({
      where: { id: topicId },
      data: { status: 'BACKLOG' },
    });
  }
}

/**
 * Add note to meeting
 */
export async function addMeetingNote(
  meetingId: string,
  userId: string,
  data: AddMeetingNoteInput
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { relationship: true },
  });

  if (!meeting) {
    throw ApiError.notFound('Meeting');
  }

  if (meeting.relationship.leaderId !== userId && meeting.relationship.icId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  const note = await prisma.meetingNote.create({
    data: {
      meetingId,
      authorId: userId,
      content: data.content,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return note;
}

/**
 * Get meeting notes (shared notes document)
 * Returns the single shared notes document or empty content if none exists
 */
export async function getMeetingNotes(meetingId: string, userId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { relationship: true },
  });

  if (!meeting) {
    throw ApiError.notFound('Meeting');
  }

  // Verify user is part of this meeting's relationship
  if (meeting.relationship.leaderId !== userId && meeting.relationship.icId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  // Get the first (and should be only) note for this meeting
  const note = await prisma.meetingNote.findFirst({
    where: { meetingId },
    include: {
      author: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (!note) {
    return {
      id: null,
      content: {},
      lastEditedBy: null,
      lastEditedAt: null,
    };
  }

  return {
    id: note.id,
    content: note.content,
    lastEditedBy: note.author,
    lastEditedAt: note.updatedAt,
  };
}

/**
 * Update meeting notes (upsert shared notes document)
 * Creates or updates the single shared notes document for a meeting
 */
export async function updateMeetingNotes(
  meetingId: string,
  userId: string,
  data: UpdateMeetingNotesInput
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { relationship: true },
  });

  if (!meeting) {
    throw ApiError.notFound('Meeting');
  }

  // Verify user is part of this meeting's relationship
  if (meeting.relationship.leaderId !== userId && meeting.relationship.icId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  // Find existing note
  const existingNote = await prisma.meetingNote.findFirst({
    where: { meetingId },
  });

  let note;
  if (existingNote) {
    // Update existing note
    note = await prisma.meetingNote.update({
      where: { id: existingNote.id },
      data: {
        content: data.content,
        authorId: userId, // Track who last edited
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  } else {
    // Create new note
    note = await prisma.meetingNote.create({
      data: {
        meetingId,
        authorId: userId,
        content: data.content,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  return {
    id: note.id,
    content: note.content,
    lastEditedBy: note.author,
    lastEditedAt: note.updatedAt,
  };
}
