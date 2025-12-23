/* eslint-disable max-lines */
/* eslint-disable complexity */
/**
 * Frontend API Error Handler
 *
 * Provides utilities to handle RFC9457-compliant API responses
 * with automatic error logging and toast notifications.
 */

import { toast } from 'react-toastify'
import { isApiSuccess, type ProblemDetails, type ApiResponse } from '@fullstack/shared-types'

/**
 * Options for handling API responses
 */
export interface HandleApiResponseOptions<TSuccess> {
  /** Callback function to execute on successful response */
  onSuccess?: (data: TSuccess) => void | Promise<void>

  /** Callback function to execute on error response */
  onError?: (error: ProblemDetails) => void | Promise<void>

  /** Custom success message (if not provided, no toast will be shown) */
  successMessage?: string | ((data: TSuccess) => string)

  /** Custom error message (if not provided, uses error.detail) */
  errorMessage?: string | ((error: ProblemDetails) => string)

  /** Whether to show success toast (default: true if successMessage is provided) */
  showSuccessToast?: boolean

  /** Whether to show error toast (default: true) */
  showErrorToast?: boolean

  /** Whether to log errors to console (default: true) */
  logErrors?: boolean

  /** Whether to log additional error fields (default: true) */
  logAdditionalFields?: boolean
}

/**
 * Handle an API response with automatic error handling
 *
 * @example
 * ```typescript
 * const response = await apiClient.users.$get();
 *
 * handleApiResponse(response, {
 *   onSuccess: (users) => {
 *     setUsers(users);
 *   },
 *   successMessage: 'Users loaded successfully',
 * });
 * ```
 *
 * @example
 * ```typescript
 * const response = await apiClient.users._id(123).$get();
 *
 * const user = handleApiResponse(response, {
 *   onSuccess: (user) => console.log('Got user:', user),
 *   onError: (error) => {
 *     if (error.status === 404) {
 *       router.push('/users');
 *     }
 *   },
 *   successMessage: (user) => `Welcome, ${user.name}!`,
 * });
 *
 * if (user) {
 *   // user is typed as TSuccess
 *   console.log(user.name);
 * }
 * ```
 */
export function handleApiResponse<TSuccess>(
  response: ApiResponse<TSuccess>,
  options: HandleApiResponseOptions<TSuccess> = {},
): TSuccess | null {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessToast = successMessage !== undefined,
    showErrorToast = true,
    logErrors = true,
    logAdditionalFields = true,
  } = options

  // Handle success case
  if (isApiSuccess(response)) {
    // Show success toast if configured
    if (showSuccessToast && successMessage) {
      const message = typeof successMessage === 'function' ? successMessage(response) : successMessage
      toast.success(message)
    }

    // Execute success callback
    if (onSuccess) {
      void onSuccess(response)
    }

    return response
  }

  // Handle error case
  const error = response as ProblemDetails

  // Log error to console
  if (logErrors) {
    console.error(`API Error [${error.status}]:`, error)

    // Log additional fields
    if (logAdditionalFields) {
      const standardFields = ['type', 'title', 'status', 'detail', 'code', 'timestamp']
      const additionalFields = Object.keys(error).filter((key) => !standardFields.includes(key))

      if (additionalFields.length > 0) {
        console.group('Additional Error Details:')
        additionalFields.forEach((field) => {
          console.log(`${field}:`, (error as any)[field])
        })
        console.groupEnd()
      }
    }
  }

  // Show error toast
  if (showErrorToast) {
    const message = errorMessage
      ? typeof errorMessage === 'function'
        ? errorMessage(error)
        : errorMessage
      : `${error.title}: ${error.detail}`

    toast.error(message)
  }

  // Execute error callback
  if (onError) {
    void onError(error)
  }

  return null
}

/**
 * Handle API response and throw on error
 * Useful for async functions where you want to handle errors with try-catch
 *
 * @example
 * ```typescript
 * try {
 *   const user = await handleApiResponseOrThrow(
 *     apiClient.users._id(123).$get(),
 *     { successMessage: 'User loaded' }
 *   );
 *   console.log(user.name); // user is typed as TSuccess
 * } catch (error) {
 *   // error is ProblemDetails
 *   console.error(error);
 * }
 * ```
 */
export async function handleApiResponseOrThrow<TSuccess>(
  responsePromise: Promise<ApiResponse<TSuccess>>,
  options: Omit<HandleApiResponseOptions<TSuccess>, 'onError'> = {},
): Promise<TSuccess> {
  const response = await responsePromise
  const result = handleApiResponse(response, options)

  if (result === null) {
    throw response as ProblemDetails
  }

  return result
}

/**
 * Create a custom error handler for specific error codes
 *
 * @example
 * ```typescript
 * const handleAuthError = createErrorCodeHandler({
 *   UNAUTHORIZED: () => {
 *     toast.error('Please login');
 *     router.push('/login');
 *   },
 *   TOKEN_EXPIRED: () => {
 *     toast.error('Session expired');
 *     router.push('/login');
 *   },
 * });
 *
 * const response = await apiClient.users.$get();
 * handleApiResponse(response, {
 *   onError: handleAuthError,
 * });
 * ```
 */
export function createErrorCodeHandler(handlers: Record<string, (error: ProblemDetails) => void | Promise<void>>) {
  return (error: ProblemDetails) => {
    const handler = handlers[error.code as string]
    if (handler) {
      void handler(error)
    }
  }
}

/**
 * Display validation errors from a ProblemDetails object
 *
 * @example
 * ```typescript
 * const response = await apiClient.users.$post({ body: data });
 *
 * handleApiResponse(response, {
 *   onError: (error) => {
 *     displayValidationErrors(error, {
 *       onFieldError: (field, message) => {
 *         setFieldError(field, message);
 *       },
 *     });
 *   },
 * });
 * ```
 */
export function displayValidationErrors(
  error: ProblemDetails,
  options: {
    /** Callback for each field error */
    onFieldError?: (field: string, message: string) => void
    /** Whether to show a toast with all errors */
    showToast?: boolean
    /** Toast message prefix */
    toastPrefix?: string
  } = {},
) {
  const { onFieldError, showToast = true, toastPrefix = 'Validation failed' } = options

  // Check if error has validation errors
  if ('errors' in error && Array.isArray(error.errors)) {
    const errors = error.errors as Array<{ field: string; message: string }>

    // Call field error callback
    if (onFieldError) {
      errors.forEach(({ field, message }) => {
        onFieldError(field, message)
      })
    }

    // Show toast with all errors
    if (showToast) {
      const errorMessages = errors.map(({ field, message }) => `${field}: ${message}`).join(', ')
      toast.error(`${toastPrefix}: ${errorMessages}`)
    }

    return true
  }

  return false
}

/**
 * Quick helper to handle response with just success callback
 *
 * @example
 * ```typescript
 * const response = await apiClient.users.$get();
 * onSuccess(response, (users) => {
 *   setUsers(users);
 * });
 * ```
 */
export function onSuccess<TSuccess>(
  response: ApiResponse<TSuccess>,
  callback: (data: TSuccess) => void | Promise<void>,
): void {
  handleApiResponse(response, {
    onSuccess: callback,
    showErrorToast: true,
    logErrors: true,
  })
}

/**
 * Quick helper to get data or null
 *
 * @example
 * ```typescript
 * const response = await apiClient.users.$get();
 * const users = getDataOrNull(response);
 *
 * if (users) {
 *   setUsers(users);
 * }
 * ```
 */
export function getDataOrNull<TSuccess>(response: ApiResponse<TSuccess>): TSuccess | null {
  return handleApiResponse(response, {
    showSuccessToast: false,
    showErrorToast: true,
    logErrors: true,
  })
}
