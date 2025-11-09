/**
 * RFC9457-compliant response helpers for HTTP APIs
 */

import type {
  ProblemDetails,
  CreateProblemDetailsOptions,
} from './rfc9457.types';
import { DEFAULT_PROBLEM_TYPE } from './rfc9457.types';
import { AbstractFrourioFrameworkError } from '../error/FrourioFrameworkError';

/**
 * Create a RFC9457 Problem Details object
 */
export function createProblemDetails(
  options: CreateProblemDetailsOptions,
): ProblemDetails {
  const problemDetails: ProblemDetails = {
    type: options.type || DEFAULT_PROBLEM_TYPE,
    title: options.title,
    status: options.status,
    detail: options.detail,
  };

  if (options.instance) {
    problemDetails.instance = options.instance;
  }

  if (options.extensions) {
    Object.entries(options.extensions).forEach(([key, value]) => {
      problemDetails[key] = value;
    });
  }

  return problemDetails;
}

/**
 * Convert error to RFC9457 Problem Details
 */
export function errorToProblemDetails(error: unknown): ProblemDetails {
  // If it's already a FrourioFrameworkError, use its toProblemDetails method
  if (error instanceof AbstractFrourioFrameworkError) {
    return error.toProblemDetails();
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return createProblemDetails({
      status: 500,
      title: 'Internal Server Error',
      detail: error.message || 'An unexpected error occurred',
      extensions: {
        errorName: error.name,
      },
    });
  }

  // Handle unknown errors
  return createProblemDetails({
    status: 500,
    title: 'Internal Server Error',
    detail: 'An unexpected error occurred',
    extensions: {
      error: String(error),
    },
  });
}

/**
 * Return success response
 */
export const returnSuccess = <T>(val: T) => ({
  status: 200 as const,
  body: val,
});

/**
 * Return RFC9457-compliant error response
 * Note: Content-Type header is set by the global error handler in app.ts
 */
export function returnProblemDetails(
  error: unknown,
  defaultStatus: number = 500,
) {
  const problemDetails = errorToProblemDetails(error);
  const status = problemDetails.status || defaultStatus;

  return {
    status: status as any,
    body: problemDetails,
  };
}

/**
 * Return error for GET requests (404 Not Found)
 */
export const returnGetError = (error: unknown) => {
  return returnProblemDetails(error, 404);
};

/**
 * Return error for POST requests (400 Bad Request / 500 Internal Server Error)
 */
export const returnPostError = (error: unknown) => {
  return returnProblemDetails(error, 500);
};

/**
 * Return error for PUT requests (500 Internal Server Error)
 */
export const returnPutError = (error: unknown) => {
  return returnProblemDetails(error, 500);
};

/**
 * Return error for PATCH requests (403 Forbidden / 500 Internal Server Error)
 */
export const returnPatchError = (error: unknown) => {
  return returnProblemDetails(error, 403);
};

/**
 * Return error for DELETE requests (403 Forbidden / 500 Internal Server Error)
 */
export const returnDeleteError = (error: unknown) => {
  return returnProblemDetails(error, 500);
};

/**
 * Return 400 Bad Request error
 * Note: Content-Type header is set by the global error handler in app.ts
 */
export function returnBadRequest(
  detail: string,
  extensions?: Record<string, any>,
) {
  const problemDetails = createProblemDetails({
    status: 400,
    title: 'Bad Request',
    detail,
    extensions,
  });

  return {
    status: 400 as const,
    body: problemDetails,
  } as const;
}

/**
 * Return 401 Unauthorized error
 * Note: Content-Type header is set by the global error handler in app.ts
 */
export function returnUnauthorized(
  detail: string,
  extensions?: Record<string, any>,
) {
  const problemDetails = createProblemDetails({
    status: 401,
    title: 'Unauthorized',
    detail,
    extensions,
  });

  return {
    status: 401 as const,
    body: problemDetails,
  } as const;
}

/**
 * Return 403 Forbidden error
 * Note: Content-Type header is set by the global error handler in app.ts
 */
export function returnForbidden(
  detail: string,
  extensions?: Record<string, any>,
) {
  const problemDetails = createProblemDetails({
    status: 403,
    title: 'Forbidden',
    detail,
    extensions,
  });

  return {
    status: 403 as const,
    body: problemDetails,
  } as const;
}

/**
 * Return 404 Not Found error
 * Note: Content-Type header is set by the global error handler in app.ts
 */
export function returnNotFound(
  detail: string,
  extensions?: Record<string, any>,
) {
  const problemDetails = createProblemDetails({
    status: 404,
    title: 'Not Found',
    detail,
    extensions,
  });

  return {
    status: 404 as const,
    body: problemDetails,
  } as const;
}

/**
 * Return 409 Conflict error
 * Note: Content-Type header is set by the global error handler in app.ts
 */
export function returnConflict(
  detail: string,
  extensions?: Record<string, any>,
) {
  const problemDetails = createProblemDetails({
    status: 409,
    title: 'Conflict',
    detail,
    extensions,
  });

  return {
    status: 409 as const,
    body: problemDetails,
  } as const;
}

/**
 * Return 500 Internal Server Error
 * Note: Content-Type header is set by the global error handler in app.ts
 */
export function returnInternalServerError(
  detail: string,
  extensions?: Record<string, any>,
) {
  const problemDetails = createProblemDetails({
    status: 500,
    title: 'Internal Server Error',
    detail,
    extensions,
  });

  return {
    status: 500 as const,
    body: problemDetails,
  } as const;
}
