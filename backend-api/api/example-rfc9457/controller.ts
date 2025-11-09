/**
 * Example controller demonstrating RFC9457-compliant error handling
 */

import { defineController } from './$relay';
import {
  returnSuccess,
  returnGetError,
  returnPostError,
  returnBadRequest,
  returnUnauthorized,
} from '$/app/http/response';
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from '$/app/error/CommonErrors';

export default defineController(() => ({
  // Example: Success response
  get: () => returnSuccess({ message: 'RFC9457 example endpoint' }),

  // Example: Handling a NotFoundError
  // GET /example-rfc9457/123
  // Response (404):
  // {
  //   "type": "https://example.com/errors/not-found",
  //   "title": "NOT_FOUND",
  //   "status": 404,
  //   "detail": "Resource with ID 123 not found",
  //   "code": "NOT_FOUND",
  //   "timestamp": "2025-11-09T08:59:00.000Z",
  //   "resourceId": "123"
  // }
  post: ({ body }) => {
    try {
      // Simulate resource not found
      if (body.simulateNotFound) {
        throw NotFoundError.create(
          `Resource with ID ${body.resourceId} not found`,
          {
            resourceId: body.resourceId,
          },
        );
      }

      // Simulate validation error
      if (body.simulateValidation) {
        throw ValidationError.create('Invalid input data', {
          errors: [
            { field: 'email', message: 'Invalid email format' },
            { field: 'age', message: 'Must be at least 18' },
          ],
        });
      }

      // Simulate unauthorized
      if (body.simulateUnauthorized) {
        throw UnauthorizedError.create('Invalid credentials', {
          reason: 'Token expired',
        });
      }

      return returnSuccess({ message: 'Request processed successfully' });
    } catch (error) {
      return returnPostError(error);
    }
  },

  // Example: Direct use of return helpers for specific status codes
  put: ({ body }) => {
    // Validation example
    if (!body.name) {
      return returnBadRequest('Name is required', {
        field: 'name',
        received: body.name,
      });
    }

    if (!body.token) {
      return returnUnauthorized('Authentication token is required', {
        hint: 'Please provide a valid token in the Authorization header',
      });
    }

    return returnSuccess({ message: 'Updated successfully' });
  },

  // Example: Handling unknown errors
  delete: () => {
    try {
      // Simulate an unexpected error
      throw new Error('Unexpected database error');
    } catch (error) {
      // The returnGetError will automatically convert this to RFC9457 format
      return returnGetError(error);
    }
  },
}));
