/**
 * Common error implementations using RFC9457-compliant format
 */

import { AbstractFrourioFrameworkError } from './FrourioFrameworkError';

/**
 * Validation Error - thrown when request validation fails
 */
export class ValidationError extends AbstractFrourioFrameworkError {
  constructor(args: {
    message: string;
    details?: Record<string, any>;
    instance?: string;
  }) {
    super({
      message: args.message,
      code: 'VALIDATION_ERROR',
      details: args.details,
      instance: args.instance,
      typeUri: 'https://example.com/errors/validation',
    });
  }

  static create(message: string, details?: Record<string, any>) {
    return new ValidationError({ message, details });
  }
}

/**
 * Not Found Error - thrown when a resource is not found
 */
export class NotFoundError extends AbstractFrourioFrameworkError {
  constructor(args: {
    message: string;
    details?: Record<string, any>;
    instance?: string;
  }) {
    super({
      message: args.message,
      code: 'NOT_FOUND',
      details: args.details,
      instance: args.instance,
      typeUri: 'https://example.com/errors/not-found',
    });
  }

  static create(message: string, details?: Record<string, any>) {
    return new NotFoundError({ message, details });
  }
}

/**
 * Unauthorized Error - thrown when authentication fails
 */
export class UnauthorizedError extends AbstractFrourioFrameworkError {
  constructor(args: {
    message: string;
    details?: Record<string, any>;
    instance?: string;
  }) {
    super({
      message: args.message,
      code: 'UNAUTHORIZED',
      details: args.details,
      instance: args.instance,
      typeUri: 'https://example.com/errors/unauthorized',
    });
  }

  static create(message: string, details?: Record<string, any>) {
    return new UnauthorizedError({ message, details });
  }
}

/**
 * Forbidden Error - thrown when user lacks required permissions
 */
export class ForbiddenError extends AbstractFrourioFrameworkError {
  constructor(args: {
    message: string;
    details?: Record<string, any>;
    instance?: string;
  }) {
    super({
      message: args.message,
      code: 'FORBIDDEN',
      details: args.details,
      instance: args.instance,
      typeUri: 'https://example.com/errors/forbidden',
    });
  }

  static create(message: string, details?: Record<string, any>) {
    return new ForbiddenError({ message, details });
  }
}

/**
 * Bad Request Error - thrown when request is malformed
 */
export class BadRequestError extends AbstractFrourioFrameworkError {
  constructor(args: {
    message: string;
    details?: Record<string, any>;
    instance?: string;
  }) {
    super({
      message: args.message,
      code: 'BAD_REQUEST',
      details: args.details,
      instance: args.instance,
      typeUri: 'https://example.com/errors/bad-request',
    });
  }

  static create(message: string, details?: Record<string, any>) {
    return new BadRequestError({ message, details });
  }
}

/**
 * Internal Server Error - thrown when an unexpected error occurs
 */
export class InternalServerError extends AbstractFrourioFrameworkError {
  constructor(args: {
    message: string;
    details?: Record<string, any>;
    instance?: string;
  }) {
    super({
      message: args.message,
      code: 'INTERNAL_SERVER_ERROR',
      details: args.details,
      instance: args.instance,
      typeUri: 'https://example.com/errors/internal-server-error',
    });
  }

  static create(message: string, details?: Record<string, any>) {
    return new InternalServerError({ message, details });
  }
}
