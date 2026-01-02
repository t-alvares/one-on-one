import { z } from 'zod';

/**
 * Action status enum (matches Prisma ActionStatus)
 */
export const ActionStatus = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']);

/**
 * Create action schema
 */
export const createActionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description too long')
    .optional()
    .nullable(),
  ownerId: z.string().uuid('Invalid owner ID'),
  competencyId: z.string().uuid('Invalid competency ID').optional().nullable(),
  dueDate: z.string().datetime('Invalid date format').optional().nullable(),
  meetingId: z.string().uuid('Invalid meeting ID').optional().nullable(),
  meetingTopicId: z.string().uuid('Invalid meeting topic ID').optional().nullable(),
});

/**
 * Update action schema
 */
export const updateActionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description too long')
    .optional()
    .nullable(),
  status: ActionStatus.optional(),
  dueDate: z.string().datetime('Invalid date format').optional().nullable(),
  competencyId: z.string().uuid('Invalid competency ID').optional().nullable(),
});

/**
 * Add progress update schema
 */
export const addProgressSchema = z.object({
  content: z
    .string()
    .min(1, 'Progress content is required')
    .max(2000, 'Progress content too long'),
});

/**
 * Query params for listing actions
 */
export const listActionsQuerySchema = z.object({
  ownerId: z.string().uuid().optional(),
  status: ActionStatus.optional(),
  competencyId: z.string().uuid().optional(),
  relationshipId: z.string().uuid().optional(),
});

export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
export type AddProgressInput = z.infer<typeof addProgressSchema>;
export type ListActionsQuery = z.infer<typeof listActionsQuerySchema>;
