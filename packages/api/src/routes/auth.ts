import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { loginSchema } from '../schemas/auth';
import { login, getUserById } from '../services/authService';

const router = Router();

/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 *
 * Request body:
 *   - email: string (valid email)
 *   - password: string (min 6 characters)
 *
 * Response:
 *   - token: JWT token
 *   - user: User object (id, email, name, role, avatarUrl)
 *
 * Errors:
 *   - INVALID_CREDENTIALS: Email or password incorrect
 *   - ACCOUNT_DISABLED: Account has been deactivated
 *   - VALIDATION_ERROR: Invalid request body
 */
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Logout current user (stateless - just returns success)
 *
 * Note: With stateless JWT, logout is handled client-side by removing the token.
 * This endpoint exists for API completeness and future token blacklist support.
 *
 * Response:
 *   - message: "Logged out successfully"
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'Logged out successfully',
    },
  });
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 *
 * Headers:
 *   - Authorization: Bearer <token>
 *
 * Response:
 *   - User object with relationship data (for ICs)
 *
 * Errors:
 *   - UNAUTHORIZED: No token or invalid token
 *   - ACCOUNT_DISABLED: Account has been deactivated
 */
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // User is already attached by authenticate middleware
      // But we fetch fresh data with relationship info
      const user = await getUserById(req.user!.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
