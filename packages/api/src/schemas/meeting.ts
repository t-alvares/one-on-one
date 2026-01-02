import { z } from 'zod';

/**
 * Meeting status enum
 */
export const MeetingStatus = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

/**
 * Topic resolution enum (matches Prisma TopicResolution)
 */
export const TopicResolution = z.enum(['DONE', 'NEXT', 'BACKLOG', 'ACTION']);

/**
 * Frequency enum for recurring meetings
 */
export const MeetingFrequency = z.enum(['WEEKLY', 'BIWEEKLY']);

/**
 * Create meeting schema
 * Leader creates meeting for a specific IC
 */
export const createMeetingSchema = z.object({
  icId: z.string().uuid('Invalid IC ID'),
  scheduledAt: z.string().datetime('Invalid date format'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .trim()
    .optional(),
});

/**
 * Generate recurring meetings schema
 * Leader generates multiple meetings at once
 */
export const generateMeetingsSchema = z.object({
  icId: z.string().uuid('Invalid IC ID'),
  frequency: MeetingFrequency,
  dayOfWeek: z.number().int().min(0).max(6, 'Day of week must be 0-6 (Sunday=0)'),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
  count: z.number().int().min(1, 'Must create at least 1 meeting').max(52, 'Cannot create more than 52 meetings'),
});

/**
 * Update meeting schema
 */
export const updateMeetingSchema = z.object({
  scheduledAt: z.string().datetime('Invalid date format').optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .trim()
    .optional(),
});

/**
 * Add topic to meeting schema
 */
export const addMeetingTopicSchema = z.object({
  topicId: z.string().uuid('Invalid topic ID'),
});

/**
 * Update meeting topic schema
 */
export const updateMeetingTopicSchema = z.object({
  order: z.number().int().min(0).optional(),
  resolution: TopicResolution.optional().nullable(),
});

/**
 * Block content schema (simplified - actual Tiptap JSON is more complex)
 */
const blockContentSchema = z.any();

/**
 * Add meeting note schema
 */
export const addMeetingNoteSchema = z.object({
  content: z.array(blockContentSchema).min(1, 'Note content is required'),
});

/**
 * Update meeting notes schema (upsert)
 * Used for the shared meeting notes that both Leader and IC can edit
 */
export const updateMeetingNotesSchema = z.object({
  content: blockContentSchema, // Can be empty object/array for new notes
});

/**
 * Query params for listing meetings
 */
export const listMeetingsQuerySchema = z.object({
  icId: z.string().uuid().optional(),
  relationshipId: z.string().uuid().optional(),
  status: MeetingStatus.optional(),
  upcoming: z.coerce.boolean().optional(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type GenerateMeetingsInput = z.infer<typeof generateMeetingsSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type AddMeetingTopicInput = z.infer<typeof addMeetingTopicSchema>;
export type UpdateMeetingTopicInput = z.infer<typeof updateMeetingTopicSchema>;
export type AddMeetingNoteInput = z.infer<typeof addMeetingNoteSchema>;
export type UpdateMeetingNotesInput = z.infer<typeof updateMeetingNotesSchema>;
export type ListMeetingsQuery = z.infer<typeof listMeetingsQuerySchema>;
