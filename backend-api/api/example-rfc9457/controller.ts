/**
 * Example controller demonstrating RFC9457-compliant error handling
 * Using the Response facade for clean, discoverable API
 */

import { defineController } from './$relay';
import { ApiResponse } from '$/app/http/ApiResponse';
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from '$/app/error/CommonErrors';

export default defineController(() => ({
  // Example: Success response using ApiResponse facade
  get: () => ApiResponse.success({ message: 'RFC9457 example endpoint' }),

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

      return ApiResponse.success({ message: 'Request processed successfully' });
    } catch (error) {
      return ApiResponse.method.post(error);
    }
  },

  // Example: Direct use of return helpers for specific status codes
  put: ({ body }) => {
    // Validation example using Response facade
    if (!body.name) {
      return ApiResponse.badRequest('Name is required', {
        field: 'name',
        received: body.name,
      });
    }

    if (!body.token) {
      return ApiResponse.unauthorized('Authentication token is required', {
        hint: 'Please provide a valid token in the Authorization header',
      });
    }

    return ApiResponse.success({ message: 'Updated successfully' });
  },

  // Example: Handling unknown errors
  delete: () => {
    try {
      // Simulate an unexpected error
      throw new Error('Unexpected database error');
    } catch (error) {
      // Response.method.delete automatically converts to RFC9457 format
      return ApiResponse.method.delete(error);
    }
  },
}));
