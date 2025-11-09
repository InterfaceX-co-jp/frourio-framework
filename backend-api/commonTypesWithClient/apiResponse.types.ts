/**
 * API Response types for shared use between backend and frontend
 *
 * These types make it easy to handle both success and error responses
 * in a type-safe way.
 */

import type { ProblemDetails } from './ProblemDetails.types';

// Re-export ProblemDetails for use in frontend
export type { ProblemDetails } from './ProblemDetails.types';

/**
 * Wraps a success response body type with ProblemDetails for error cases
 *
 * Usage in index.ts:
 * ```typescript
 * import type { ApiResponse } from '$/commonTypesWithClient/apiResponse.types';
 *
 * export type Methods = DefineMethods<{
 *   get: {
 *     resBody: ApiResponse<User>;
 *   };
 * }>;
 * ```
 *
 * Frontend usage:
 * ```typescript
 * const response = await apiClient.users._id(123).$get();
 *
 * if (isApiSuccess(response)) {
 *   // TypeScript knows response is User here
 *   console.log(response.name);
 * } else {
 *   // TypeScript knows response is ProblemDetails here
 *   console.error(response.detail);
 * }
 * ```
 */
export type ApiResponse<TSuccess> = TSuccess | ProblemDetails;

/**
 * Type guard to check if an API response is successful (not an error)
 *
 * This can be used on both backend and frontend to discriminate between
 * success and error responses.
 *
 * @example
 * ```typescript
 * const response = await apiClient.users.$get();
 *
 * if (isApiSuccess(response)) {
 *   // response is typed as TSuccess
 *   console.log(response);
 * } else {
 *   // response is typed as ProblemDetails
 *   console.error(response.detail);
 * }
 * ```
 */
export function isApiSuccess<TSuccess>(
  response: ApiResponse<TSuccess>,
): response is TSuccess {
  // ProblemDetails always has these RFC9457-required fields
  return !(
    response &&
    typeof response === 'object' &&
    'type' in response &&
    'title' in response &&
    'status' in response &&
    'detail' in response
  );
}

/**
 * Type guard to check if an API response is an error (ProblemDetails)
 *
 * @example
 * ```typescript
 * const response = await apiClient.users.$get();
 *
 * if (isApiError(response)) {
 *   // response is typed as ProblemDetails
 *   console.error(response.detail);
 * } else {
 *   // response is typed as TSuccess
 *   console.log(response);
 * }
 * ```
 */
export function isApiError<TSuccess>(
  response: ApiResponse<TSuccess>,
): response is ProblemDetails {
  return !isApiSuccess(response);
}
