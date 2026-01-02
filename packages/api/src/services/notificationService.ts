import prisma from '../lib/prisma';
import { ApiError } from '../middleware/errorHandler';
import { NotificationType } from '@prisma/client';

/**
 * Notification Service
 * Handles notification operations
 */

/**
 * List notifications for a user
 */
export async function listNotifications(
  userId: string,
  options: { unreadOnly?: boolean }
) {
  const where: Record<string, unknown> = {
    userId,
  };

  if (options.unreadOnly) {
    where.read = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return notifications;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return count;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw ApiError.notFound('Notification');
  }

  if (notification.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  });
}

/**
 * Create a notification
 */
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data ? JSON.stringify(data.data) : null,
    },
  });

  return notification;
}

/**
 * Helper: Notify about topic added to meeting
 */
export async function notifyTopicAdded(
  recipientId: string,
  addedByName: string,
  topicTitle: string,
  meetingId: string,
  topicId: string,
  meetingDate: Date
) {
  const dateStr = meetingDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return createNotification({
    userId: recipientId,
    type: 'TOPIC_ADDED',
    title: 'New topic added',
    message: `${addedByName} added '${topicTitle}' to your ${dateStr} 1:1`,
    data: { meetingId, topicId },
  });
}

/**
 * Helper: Notify about action assigned
 */
export async function notifyActionAssigned(
  recipientId: string,
  assignedByName: string,
  actionTitle: string,
  actionId: string
) {
  return createNotification({
    userId: recipientId,
    type: 'ACTION_ASSIGNED',
    title: 'New action assigned',
    message: `${assignedByName} assigned you: '${actionTitle}'`,
    data: { actionId },
  });
}

/**
 * Helper: Notify about meeting scheduled
 */
export async function notifyMeetingScheduled(
  recipientId: string,
  scheduledByName: string,
  meetingTitle: string,
  meetingId: string,
  scheduledAt: Date
) {
  const dateStr = scheduledAt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return createNotification({
    userId: recipientId,
    type: 'MEETING_REMINDER',
    title: 'Meeting scheduled',
    message: `${scheduledByName} scheduled '${meetingTitle}' for ${dateStr}`,
    data: { meetingId },
  });
}
