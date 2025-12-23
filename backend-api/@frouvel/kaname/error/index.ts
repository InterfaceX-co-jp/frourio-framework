/**
 * Error handling exports
 *
 * This module provides easy access to all error-related functionality
 */

// Export base error class and types
export {
  AbstractFrourioFrameworkError,
  ErrorCode,
  ErrorCodeToHttpStatus,
} from './FrourioFrameworkError';

// Export common error classes
export {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  InternalServerError,
} from './CommonErrors';

// Re-export RFC9457 types for convenience
export type {
  ProblemDetails,
  CreateProblemDetailsOptions,
} from '../http/type/nfc9457';
