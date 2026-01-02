import prisma from '../lib/prisma';
import { verifyPassword } from '../lib/password';
import { signToken } from '../lib/jwt';
import { ApiError } from '../middleware/errorHandler';

/**
 * User data returned after login (excludes password)
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
  avatarUrl: string | null;
}

/**
 * Login response data
 */
export interface LoginResult {
  token: string;
  user: AuthUser;
}

/**
 * User with their relationship data (for GET /me)
 */
export interface UserWithRelationship extends AuthUser {
  relationship?: {
    id: string;
    leader: {
      id: string;
      name: string;
    };
  } | null;
}

/**
 * Authenticate user with email and password
 * Returns JWT token and user data on success
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  // Find user by email (case-insensitive)
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // User not found
  if (!user) {
    throw ApiError.invalidCredentials();
  }

  // Check if account is active
  if (!user.isActive) {
    throw ApiError.accountDisabled();
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw ApiError.invalidCredentials();
  }

  // Generate JWT token
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Return token and user data (excluding password)
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin,
      avatarUrl: user.avatarUrl,
    },
  };
}

/**
 * Get user by ID with their relationship data
 * For ICs: includes their leader's info
 * For Leaders: relationship is null (they have multiple ICs)
 */
export async function getUserById(userId: string): Promise<UserWithRelationship> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      // IC's relationship with their leader
      icRelationship: {
        include: {
          leader: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw ApiError.notFound('User');
  }

  if (!user.isActive) {
    throw ApiError.accountDisabled();
  }

  // Build response
  const result: UserWithRelationship = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isAdmin: user.isAdmin,
    avatarUrl: user.avatarUrl,
  };

  // Include relationship for ICs
  if (user.icRelationship) {
    result.relationship = {
      id: user.icRelationship.id,
      leader: {
        id: user.icRelationship.leader.id,
        name: user.icRelationship.leader.name,
      },
    };
  }

  return result;
}
