/**
 * Validator Facade
 *
 * Laravel-inspired validation facade for Zod with automatic RFC9457 error responses.
 * Simplifies validation and error handling in controllers.
 *
 * @example
 * ```typescript
 * import { Validator } from '$/app/validation/Validator';
 * import { z } from 'zod';
 *
 * const schema = z.object({ name: z.string(), age: z.number() });
 *
 * // Simple validation
 * const result = Validator.validate(body, schema);
 * if (result.isError) {
 *   return result.response; // RFC9457 error response
 * }
 * const data = result.data; // Typed data
 *
 * // Validate and execute
 * return Validator.validateAndExecute(body, schema, (data) => {
 *   return ApiResponse.success(data);
 * });
 * ```
 */

import type { z } from 'zod';
import { ApiResponse } from '../http/ApiResponse';

/**
 * Validation result when successful
 */
export interface ValidationSuccess<T> {
  isError: false;
  data: T;
}

/**
 * Validation result when failed
 */
export interface ValidationFailure {
  isError: true;
  response: ReturnType<typeof ApiResponse.badRequest>;
  errors: Array<{ field: string; message: string }>;
}

/**
 * Union type for validation results
 */
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Validator Facade
 *
 * Provides a clean, Laravel-inspired API for validation with automatic RFC9457 error handling.
 */
export const Validator = {
  /**
   * Validate data against a Zod schema
   *
   * Returns a result object with `isError` flag.
   * - If validation fails: isError=true, response contains RFC9457 error
   * - If validation succeeds: isError=false, data contains typed validated data
   *
   * @example
   * ```typescript
   * const result = Validator.validate(body, userSchema);
   * if (result.isError) {
   *   return result.response; // RFC9457 error
   * }
   * const user = result.data; // Typed data
   * ```
   */
  validate<T extends z.ZodType>(
    data: unknown,
    schema: T,
  ): ValidationResult<z.infer<T>> {
    const validation = schema.safeParse(data);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return {
        isError: true,
        response: ApiResponse.badRequest('バリデーションエラー', { errors }),
        errors,
      };
    }

    return {
      isError: false,
      data: validation.data,
    };
  },

  /**
   * Validate and execute a callback with validated data
   *
   * If validation fails, returns RFC9457 error response.
   * If validation succeeds, executes callback with typed data.
   *
   * @example
   * ```typescript
   * return Validator.validateAndExecute(body, schema, (data) => {
   *   // data is fully typed
   *   if (data.age < 18) {
   *     return ApiResponse.forbidden('18歳未満は登録できません');
   *   }
   *   return ApiResponse.success(data);
   * });
   * ```
   */
  validateAndExecute<T extends z.ZodType, R>(
    data: unknown,
    schema: T,
    callback: (validatedData: z.infer<T>) => R,
  ): R | ReturnType<typeof ApiResponse.badRequest> {
    const result = this.validate(data, schema);

    if (result.isError) {
      return result.response;
    }

    return callback(result.data);
  },

  /**
   * Validate multiple data sources against their respective schemas
   *
   * Useful when validating body, query, and params together.
   *
   * @example
   * ```typescript
   * const result = Validator.validateMultiple({
   *   body: { data: body, schema: bodySchema },
   *   query: { data: query, schema: querySchema },
   * });
   *
   * if (result.isError) {
   *   return result.response;
   * }
   *
   * const { body: validBody, query: validQuery } = result.data;
   * ```
   */
  validateMultiple<
    T extends Record<string, { data: unknown; schema: z.ZodType }>,
  >(
    sources: T,
  ): ValidationResult<{
    [K in keyof T]: z.infer<T[K]['schema']>;
  }> {
    const validatedData: any = {};
    const allErrors: Array<{ field: string; message: string; source: string }> =
      [];

    for (const [sourceName, { data, schema }] of Object.entries(sources)) {
      const validation = schema.safeParse(data);

      if (!validation.success) {
        const errors = validation.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          source: sourceName,
        }));
        allErrors.push(...errors);
      } else {
        validatedData[sourceName] = validation.data;
      }
    }

    if (allErrors.length > 0) {
      return {
        isError: true,
        response: ApiResponse.badRequest('バリデーションエラー', {
          errors: allErrors,
        }),
        errors: allErrors,
      };
    }

    return {
      isError: false,
      data: validatedData,
    };
  },

  /**
   * Create a reusable validator function for a specific schema
   *
   * Useful when the same schema is used multiple times.
   *
   * @example
   * ```typescript
   * const validateUser = Validator.createValidator(userSchema);
   *
   * // In controller
   * const result = validateUser(body);
   * if (result.isError) return result.response;
   * ```
   */
  createValidator<T extends z.ZodType>(schema: T) {
    return (data: unknown): ValidationResult<z.infer<T>> => {
      return this.validate(data, schema);
    };
  },

  /**
   * Type guard to check if result is an error
   *
   * @example
   * ```typescript
   * const result = Validator.validate(body, schema);
   *
   * if (Validator.isError(result)) {
   *   return result.response;
   * }
   *
   * // TypeScript knows result.data is available
   * const data = result.data;
   * ```
   */
  isError<T>(result: ValidationResult<T>): result is ValidationFailure {
    return result.isError;
  },

  /**
   * Type guard to check if result is successful
   *
   * @example
   * ```typescript
   * const result = Validator.validate(body, schema);
   *
   * if (Validator.isSuccess(result)) {
   *   // TypeScript knows result.data is available
   *   return ApiResponse.success(result.data);
   * }
   * ```
   */
  isSuccess<T>(result: ValidationResult<T>): result is ValidationSuccess<T> {
    return !result.isError;
  },
} as const;
