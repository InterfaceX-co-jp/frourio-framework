/**
 * Response helpers for HTTP APIs
 *
 * These functions now use RFC9457-compliant Problem Details format for error responses.
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 */

// Export all RFC9457-compliant helpers
export {
  returnSuccess,
  returnProblemDetails,
  returnGetError,
  returnPostError,
  returnPutError,
  returnPatchError,
  returnDeleteError,
  returnBadRequest,
  returnUnauthorized,
  returnForbidden,
  returnNotFound,
  returnConflict,
  returnInternalServerError,
  createProblemDetails,
  errorToProblemDetails,
} from './rfc9457.response';

// Export types
export type {
  ProblemDetails,
  CreateProblemDetailsOptions,
} from './rfc9457.types';
export {
  PROBLEM_DETAILS_MEDIA_TYPE,
  DEFAULT_PROBLEM_TYPE,
} from './rfc9457.types';
