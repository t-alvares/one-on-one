import { z } from 'zod';

/**
 * User role enum
 */
export const UserRole = z.enum(['ADMIN', 'LEADER', 'IC']);

/**
 * Create user schema (admin only)
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim(),
  role: UserRole,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

/**
 * Update user schema (admin only)
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim()
    .optional(),
  role: UserRole.optional(),
  isActive: z.boolean().optional(),
});

/**
 * Create relationship schema
 */
export const createRelationshipSchema = z.object({
  leaderId: z.string().uuid('Invalid leader ID'),
  icId: z.string().uuid('Invalid IC ID'),
});

/**
 * Query params for listing users
 */
export const listUsersQuerySchema = z.object({
  role: UserRole.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
