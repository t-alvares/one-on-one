import prisma from '../lib/prisma';
import { hashPassword } from '../lib/password';
import { ApiError } from '../middleware/errorHandler';
import type { CreateUserInput, UpdateUserInput, CreateRelationshipInput } from '../schemas/user';

/**
 * User Service
 * Handles user management operations (admin only)
 */

/**
 * List all users with optional filters
 */
export async function listUsers(options: {
  role?: string;
  search?: string;
  page: number;
  pageSize: number;
}) {
  const { role, search, page, pageSize } = options;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
    },
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw ApiError.notFound('User');
  }

  return user;
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserInput) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw ApiError.validation('Email already exists');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return user;
}

/**
 * Update a user
 */
export async function updateUser(userId: string, data: UpdateUserInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound('User');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  return updated;
}

/**
 * Deactivate a user (soft delete)
 */
export async function deactivateUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound('User');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
}

/**
 * List all relationships
 */
export async function listRelationships() {
  const relationships = await prisma.relationship.findMany({
    include: {
      leader: {
        select: { id: true, name: true },
      },
      ic: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return relationships;
}

/**
 * Create a leader-IC relationship
 */
export async function createRelationship(data: CreateRelationshipInput) {
  // Verify leader exists and has LEADER role
  const leader = await prisma.user.findUnique({
    where: { id: data.leaderId },
  });

  if (!leader || leader.role !== 'LEADER') {
    throw ApiError.badRequest('INVALID_LEADER', 'User is not a Leader');
  }

  // Verify IC exists and has IC role
  const ic = await prisma.user.findUnique({
    where: { id: data.icId },
  });

  if (!ic || ic.role !== 'IC') {
    throw ApiError.badRequest('INVALID_IC', 'User is not an IC');
  }

  // Check if IC already has a relationship
  const existing = await prisma.relationship.findUnique({
    where: { icId: data.icId },
  });

  if (existing) {
    throw ApiError.badRequest('IC_ALREADY_ASSIGNED', 'This IC already has a Leader');
  }

  const relationship = await prisma.relationship.create({
    data: {
      leaderId: data.leaderId,
      icId: data.icId,
    },
    include: {
      leader: { select: { id: true, name: true } },
      ic: { select: { id: true, name: true } },
    },
  });

  return relationship;
}

/**
 * Delete a relationship
 */
export async function deleteRelationship(relationshipId: string) {
  const relationship = await prisma.relationship.findUnique({
    where: { id: relationshipId },
  });

  if (!relationship) {
    throw ApiError.notFound('Relationship');
  }

  await prisma.relationship.delete({
    where: { id: relationshipId },
  });
}
