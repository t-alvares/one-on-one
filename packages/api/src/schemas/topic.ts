import { z } from 'zod';

/**
 * Topic status enum (matches Prisma TopicStatus)
 */
export const topicStatusSchema = z.enum(['BACKLOG', 'SCHEDULED', 'DISCUSSED', 'ARCHIVED']);

/**
 * Content schema for Tiptap JSON format
 * Accepts either:
 * - Full Tiptap doc: { type: "doc", content: [...] }
 * - Just the content array: [...]
 * - null for empty content
 */
const contentSchema = z.union([
  z.object({
    type: z.string(),
    content: z.array(z.any()).optional(),
  }).passthrough(),
  z.array(z.any()),
  z.null(),
]).optional();

/**
 * Create topic schema
 */
export const createTopicSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .trim(),
  content: contentSchema.default([]),
  labelId: z.string().uuid('Invalid label ID').optional().nullable(),
  aboutIcId: z.string().uuid('Invalid IC ID').optional().nullable(),
});

/**
 * Update topic schema
 */
export const updateTopicSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .trim()
    .optional(),
  content: contentSchema,
  labelId: z.string().uuid('Invalid label ID').optional().nullable(),
});

/**
 * Query params for listing topics
 */
export const listTopicsQuerySchema = z.object({
  status: topicStatusSchema.optional(),
  labelId: z.string().uuid().optional(),
  aboutIcId: z.string().uuid().optional(),
  /** If true, also include the IC's own topics (for Leaders viewing IC workspace) */
  includeCounterparty: z.enum(['true', 'false']).optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type ListTopicsQuery = z.infer<typeof listTopicsQuerySchema>;
export type TopicStatus = z.infer<typeof topicStatusSchema>;
