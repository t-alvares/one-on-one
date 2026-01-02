import { z } from 'zod';

/**
 * Content schema for BlockNote JSON format
 * Accepts either:
 * - Array of blocks: [{ type: "paragraph", content: [...] }, ...]
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
 * Create thought schema
 */
export const createThoughtSchema = z.object({
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
 * Update thought schema
 */
export const updateThoughtSchema = z.object({
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
 * Promote thought to topic schema
 */
export const promoteThoughtSchema = z.object({
  labelId: z.string().uuid('Invalid label ID').optional().nullable(),
});

/**
 * Query params for listing thoughts
 */
export const listThoughtsQuerySchema = z.object({
  labelId: z.string().uuid().optional(),
  aboutIcId: z.string().uuid().optional(),
});

/**
 * Reorder thoughts schema
 */
export const reorderThoughtsSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1, 'At least one thought ID is required'),
});

export type CreateThoughtInput = z.infer<typeof createThoughtSchema>;
export type UpdateThoughtInput = z.infer<typeof updateThoughtSchema>;
export type PromoteThoughtInput = z.infer<typeof promoteThoughtSchema>;
export type ListThoughtsQuery = z.infer<typeof listThoughtsQuerySchema>;
export type ReorderThoughtsInput = z.infer<typeof reorderThoughtsSchema>;
