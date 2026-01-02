/**
 * Standard API response types based on API_SPEC.md
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Error codes from API_SPEC.md
 */
export const ErrorCode = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Business logic errors
  IC_ALREADY_ASSIGNED: 'IC_ALREADY_ASSIGNED',
  INVALID_LEADER: 'INVALID_LEADER',
  INVALID_IC: 'INVALID_IC',
  TOPIC_ALREADY_SCHEDULED: 'TOPIC_ALREADY_SCHEDULED',
  MEETING_COMPLETED: 'MEETING_COMPLETED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * HTTP status codes mapped to error codes
 */
export const ErrorHttpStatus: Record<ErrorCodeType, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.ACCOUNT_DISABLED]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.IC_ALREADY_ASSIGNED]: 400,
  [ErrorCode.INVALID_LEADER]: 400,
  [ErrorCode.INVALID_IC]: 400,
  [ErrorCode.TOPIC_ALREADY_SCHEDULED]: 400,
  [ErrorCode.MEETING_COMPLETED]: 400,
  [ErrorCode.INTERNAL_ERROR]: 500,
};
