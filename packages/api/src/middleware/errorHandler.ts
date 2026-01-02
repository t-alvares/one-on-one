import { Request, Response, NextFunction } from 'express';
import { ErrorCode, ErrorHttpStatus, ErrorCodeType } from '../types/api';

/**
 * Custom API Error class with code and status
 */
export class ApiError extends Error {
  public readonly code: ErrorCodeType;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCodeType, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = ErrorHttpStatus[code] || 500;
    this.details = details;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Factory methods for common errors
   */
  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(ErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Access denied'): ApiError {
    return new ApiError(ErrorCode.FORBIDDEN, message);
  }

  static notFound(resource = 'Resource'): ApiError {
    return new ApiError(ErrorCode.NOT_FOUND, `${resource} not found`);
  }

  static validation(message: string, details?: unknown): ApiError {
    return new ApiError(ErrorCode.VALIDATION_ERROR, message, details);
  }

  static invalidCredentials(): ApiError {
    return new ApiError(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password');
  }

  static accountDisabled(): ApiError {
    return new ApiError(ErrorCode.ACCOUNT_DISABLED, 'Account has been deactivated');
  }

  static internal(message = 'An unexpected error occurred'): ApiError {
    return new ApiError(ErrorCode.INTERNAL_ERROR, message);
  }

  static badRequest(code: string, message: string): ApiError {
    // Map known codes to their error types
    const knownCodes: Record<string, ErrorCodeType> = {
      IC_ALREADY_ASSIGNED: ErrorCode.IC_ALREADY_ASSIGNED,
      INVALID_LEADER: ErrorCode.INVALID_LEADER,
      INVALID_IC: ErrorCode.INVALID_IC,
      TOPIC_ALREADY_SCHEDULED: ErrorCode.TOPIC_ALREADY_SCHEDULED,
      MEETING_COMPLETED: ErrorCode.MEETING_COMPLETED,
    };
    const errorCode = knownCodes[code] || ErrorCode.VALIDATION_ERROR;
    return new ApiError(errorCode, message);
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging
  console.error('[Error]', err);

  // Handle ApiError instances
  if (err instanceof ApiError) {
    const errorResponse: { code: ErrorCodeType; message: string; details?: unknown } = {
      code: err.code,
      message: err.message,
    };

    if (err.details && process.env.NODE_ENV === 'development') {
      errorResponse.details = err.details;
    }

    res.status(err.statusCode).json({
      success: false,
      error: errorResponse,
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      const target = prismaError.meta?.target?.join(', ') || 'field';
      res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: `A record with this ${target} already exists`,
        },
      });
      return;
    }

    if (prismaError.code === 'P2025') {
      // Record not found
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Record not found',
        },
      });
      return;
    }
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  });
}
