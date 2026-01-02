/**
 * Role-based authorization middleware
 * Re-exports from auth.ts for convenience
 */

export {
  requireRole,
  requireAdmin,
  requireLeader,
  requireIC,
} from './auth';
