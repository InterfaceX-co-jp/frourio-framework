import { describe, it, expect } from 'vitest';
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  InternalServerError,
} from '../../error/CommonErrors';
import { ApiResponse, PROBLEM_DETAILS_MEDIA_TYPE } from '../ApiResponse';

// Access utils through ApiResponse facade
const { createProblemDetails, errorToProblemDetails } = ApiResponse.utils;

describe('RFC9457 Error Handling', () => {
  describe('ProblemDetails Creation', () => {
    it('should create a basic problem details object', () => {
      const problem = createProblemDetails({
        status: 404,
        title: 'Not Found',
        detail: 'Resource not found',
      });

      expect(problem).toMatchObject({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Resource not found',
      });
    });

    it('should include custom type URI', () => {
      const problem = createProblemDetails({
        status: 404,
        title: 'Not Found',
        detail: 'Resource not found',
        type: 'https://example.com/errors/not-found',
      });

      expect(problem.type).toBe('https://example.com/errors/not-found');
    });

    it('should include instance URI', () => {
      const problem = createProblemDetails({
        status: 404,
        title: 'Not Found',
        detail: 'Resource not found',
        instance: '/users/123',
      });

      expect(problem.instance).toBe('/users/123');
    });

    it('should include extension members', () => {
      const problem = createProblemDetails({
        status: 400,
        title: 'Validation Error',
        detail: 'Invalid input',
        extensions: {
          field: 'email',
          received: 'invalid-email',
        },
      });

      expect(problem.field).toBe('email');
      expect(problem.received).toBe('invalid-email');
    });
  });

  describe('FrourioFrameworkError', () => {
    it('should convert NotFoundError to ProblemDetails', () => {
      const error = NotFoundError.create('User not found', { userId: '123' });
      const problem = error.toProblemDetails();

      expect(problem).toMatchObject({
        type: 'https://example.com/errors/not-found',
        title: 'NOT_FOUND',
        status: 404,
        detail: 'User not found',
        code: 'NOT_FOUND',
        userId: '123',
      });
      expect(problem.timestamp).toBeDefined();
    });

    it('should convert ValidationError to ProblemDetails', () => {
      const error = ValidationError.create('Invalid input', {
        errors: [{ field: 'email', message: 'Required' }],
      });
      const problem = error.toProblemDetails();

      expect(problem).toMatchObject({
        type: 'https://example.com/errors/validation',
        title: 'VALIDATION_ERROR',
        status: 400,
        detail: 'Invalid input',
        code: 'VALIDATION_ERROR',
      });
      expect(problem.errors).toEqual([{ field: 'email', message: 'Required' }]);
    });

    it('should convert UnauthorizedError to ProblemDetails', () => {
      const error = UnauthorizedError.create('Invalid token', {
        reason: 'Token expired',
      });
      const problem = error.toProblemDetails();

      expect(problem).toMatchObject({
        type: 'https://example.com/errors/unauthorized',
        title: 'UNAUTHORIZED',
        status: 401,
        detail: 'Invalid token',
        code: 'UNAUTHORIZED',
        reason: 'Token expired',
      });
    });

    it('should include instance if provided', () => {
      const error = new NotFoundError({
        message: 'Resource not found',
        instance: '/users/123',
      });
      const problem = error.toProblemDetails();

      expect(problem.instance).toBe('/users/123');
    });
  });

  describe('errorToProblemDetails', () => {
    it('should convert FrourioFrameworkError', () => {
      const error = NotFoundError.create('Not found');
      const problem = errorToProblemDetails(error);

      expect(problem.status).toBe(404);
      expect(problem.title).toBe('NOT_FOUND');
    });

    it('should convert standard Error', () => {
      const error = new Error('Something went wrong');
      const problem = errorToProblemDetails(error);

      expect(problem).toMatchObject({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Something went wrong',
        errorName: 'Error',
      });
    });

    it('should handle unknown errors', () => {
      const error = 'string error';
      const problem = errorToProblemDetails(error);

      expect(problem).toMatchObject({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
      });
      expect(problem.error).toBe('string error');
    });

    it('should handle null/undefined errors', () => {
      const problem = errorToProblemDetails(null);

      expect(problem).toMatchObject({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
      });
    });
  });

  describe('Error Properties', () => {
    it('should have correct HTTP status code', () => {
      const notFoundError = NotFoundError.create('Not found');
      const validationError = ValidationError.create('Invalid');
      const unauthorizedError = UnauthorizedError.create('Unauthorized');

      expect(notFoundError.httpStatusCode).toBe(404);
      expect(validationError.httpStatusCode).toBe(400);
      expect(unauthorizedError.httpStatusCode).toBe(401);
    });

    it('should identify client errors', () => {
      const error = ValidationError.create('Invalid');
      expect(error.isClientError()).toBe(true);
      expect(error.isServerError()).toBe(false);
    });

    it('should identify server errors', () => {
      const error = InternalServerError.create('Server error');
      expect(error.isServerError()).toBe(true);
      expect(error.isClientError()).toBe(false);
    });

    it('should check error code', () => {
      const error = NotFoundError.create('Not found');
      expect(error.isErrorCode('NOT_FOUND' as any)).toBe(true);
      expect(error.isErrorCode('VALIDATION_ERROR' as any)).toBe(false);
    });
  });

  describe('Media Type', () => {
    it('should use correct media type', () => {
      expect(PROBLEM_DETAILS_MEDIA_TYPE).toBe('application/problem+json');
    });
  });
});
