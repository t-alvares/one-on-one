import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from './errorHandler';

/**
 * Validation middleware factory
 * Creates middleware that validates request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        next(
          ApiError.validation('Invalid request data', {
            errors: formattedErrors,
          })
        );
        return;
      }
      next(error);
    }
  };
}

/**
 * Validation middleware for query parameters
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        next(
          ApiError.validation('Invalid query parameters', {
            errors: formattedErrors,
          })
        );
        return;
      }
      next(error);
    }
  };
}

/**
 * Validation middleware for route parameters
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        next(
          ApiError.validation('Invalid route parameters', {
            errors: formattedErrors,
          })
        );
        return;
      }
      next(error);
    }
  };
}
