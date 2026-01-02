import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import prisma from '../lib/prisma';
import { ApiError } from './errorHandler';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyToken(token);

    if (!payload) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw ApiError.accountDisabled();
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch {
    // Silently continue without user
    next();
  }
}

/**
 * Role-based authorization middleware
 * Must be used after authenticate middleware
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires one of roles: ${roles.join(', ')}`));
    }

    next();
  };
}

/**
 * Convenience middleware for admin-only routes
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Convenience middleware for leader-only routes
 */
export const requireLeader = requireRole('LEADER', 'ADMIN');

/**
 * Convenience middleware for IC-only routes
 */
export const requireIC = requireRole('IC');
