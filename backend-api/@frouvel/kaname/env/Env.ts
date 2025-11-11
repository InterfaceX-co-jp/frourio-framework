/* eslint-disable max-lines */
/**
 * Environment Module
 *
 * Provides a unified API for environment variable management.
 * Inspired by Laravel's env() helper and environment utilities.
 * Supports type-safe validation via Zod schemas.
 *
 * @example
 * // Get environment variable with default
 * const apiUrl = Env.get('API_URL', 'http://localhost:3000');
 *
 * // Get required environment variable (throws if missing)
 * const dbUrl = Env.getOrFail('DATABASE_URL');
 *
 * // Validate environment schema
 * Env.registerSchema(envSchema);
 *
 * @example
 * // Boolean helpers
 * const isDebug = Env.getBoolean('DEBUG', false);
 * const isProduction = Env.isProduction();
 *
 * @example
 * // Numeric helpers
 * const port = Env.getInt('PORT', 3000);
 */

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Schema validation options
 */
interface SchemaValidationOptions {
  /**
   * Whether to exit process on validation failure
   * @default true
   */
  exitOnError?: boolean;

  /**
   * Custom error handler
   */
  onError?: (error: z.ZodError) => void;
}

// ============================================================================
// Internal State
// ============================================================================

/**
 * Registered Zod schema for environment validation
 * @internal
 */
let registeredSchema: z.ZodSchema | null = null;

/**
 * Validation status
 * @internal
 */
let isValidated: boolean = false;

// ============================================================================
// Environment Facade
// ============================================================================

/**
 * Environment facade providing environment variable utilities
 */
export const Env = {
  /**
   * Get an environment variable value with optional default
   *
   * @param key - The environment variable name
   * @param defaultValue - Default value if variable is not set
   * @returns The environment variable value or default
   *
   * @example
   * const apiUrl = Env.get('API_URL', 'http://localhost:3000');
   * const nodeEnv = Env.get('NODE_ENV', 'development');
   */
  get(key: string, defaultValue?: string): string | undefined {
    return process.env[key] ?? defaultValue;
  },

  /**
   * Get an environment variable or throw if missing
   *
   * @param key - The environment variable name
   * @returns The environment variable value
   * @throws Error if the environment variable is not set
   *
   * @example
   * try {
   *   const dbUrl = Env.getOrFail('DATABASE_URL');
   * } catch (error) {
   *   console.error('Missing required environment variable');
   * }
   */
  getOrFail(key: string): string {
    const value = process.env[key];
    if (value === undefined || value === '') {
      throw new Error(`Environment variable [${key}] is required but not set`);
    }
    return value;
  },

  /**
   * Get an environment variable as boolean
   *
   * Treats 'true', '1', 'yes', 'on' as true (case-insensitive)
   * Treats 'false', '0', 'no', 'off' as false (case-insensitive)
   *
   * @param key - The environment variable name
   * @param defaultValue - Default value if variable is not set
   * @returns The boolean value
   *
   * @example
   * const isDebug = Env.getBoolean('DEBUG', false);
   * const useCache = Env.getBoolean('USE_CACHE', true);
   */
  getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }

    const normalized = value.toLowerCase().trim();
    const truthyValues = ['true', '1', 'yes', 'on'];
    const falsyValues = ['false', '0', 'no', 'off'];

    if (truthyValues.includes(normalized)) {
      return true;
    }
    if (falsyValues.includes(normalized)) {
      return false;
    }

    return defaultValue;
  },

  /**
   * Get an environment variable as integer
   *
   * @param key - The environment variable name
   * @param defaultValue - Default value if variable is not set or invalid
   * @returns The integer value
   *
   * @example
   * const port = Env.getInt('PORT', 3000);
   * const maxConnections = Env.getInt('MAX_CONNECTIONS', 100);
   */
  getInt(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }

    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  },

  /**
   * Get an environment variable as float
   *
   * @param key - The environment variable name
   * @param defaultValue - Default value if variable is not set or invalid
   * @returns The float value
   *
   * @example
   * const timeout = Env.getFloat('TIMEOUT', 1.5);
   * const ratio = Env.getFloat('CACHE_RATIO', 0.75);
   */
  getFloat(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }

    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  },

  /**
   * Get an environment variable as JSON
   *
   * @param key - The environment variable name
   * @param defaultValue - Default value if variable is not set or invalid JSON
   * @returns The parsed JSON value
   *
   * @example
   * const config = Env.getJson('APP_CONFIG', { feature: 'enabled' });
   * const options = Env.getJson<MyOptions>('OPTIONS', defaultOptions);
   */
  getJson<T = any>(key: string, defaultValue?: T): T | undefined {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Register and validate a Zod schema for environment variables
   *
   * @param schema - The Zod schema to validate against
   * @param options - Validation options
   *
   * @example
   * import { z } from 'zod';
   *
   * const envSchema = z.object({
   *   NODE_ENV: z.enum(['development', 'production', 'test']),
   *   PORT: z.string().regex(/^\d+$/),
   *   DATABASE_URL: z.string().url(),
   * });
   *
   * Env.registerSchema(envSchema);
   *
   * @example
   * // Custom error handling
   * Env.registerSchema(envSchema, {
   *   exitOnError: false,
   *   onError: (error) => {
   *     logger.error('Environment validation failed', error);
   *   }
   * });
   */
  registerSchema(
    schema: z.ZodSchema,
    options: SchemaValidationOptions = {},
  ): void {
    const { exitOnError = true, onError } = options;

    registeredSchema = schema;

    try {
      schema.parse(process.env);
      isValidated = true;
      console.log('[Env] Environment variables validated successfully');
    } catch (error) {
      isValidated = false;

      if (error instanceof z.ZodError) {
        console.error(
          '[Env] Environment variable validation failed:',
          error.flatten().fieldErrors,
        );

        if (onError) {
          onError(error);
        }

        if (exitOnError) {
          process.exit(1);
        }
      } else {
        console.error(
          '[Env] An unexpected error occurred during environment validation:',
          error,
        );

        if (exitOnError) {
          process.exit(1);
        }
      }
    }
  },

  /**
   * Get the registered schema
   *
   * @returns The registered Zod schema or null
   *
   * @example
   * const schema = Env.getSchema();
   * if (schema) {
   *   // Schema is registered
   * }
   */
  getSchema(): z.ZodSchema | null {
    return registeredSchema;
  },

  /**
   * Check if environment has been validated
   *
   * @returns True if validated successfully
   *
   * @example
   * if (!Env.isValidated()) {
   *   console.warn('Environment not validated yet');
   * }
   */
  isValidated(): boolean {
    return isValidated;
  },

  /**
   * Check if an environment variable exists (even if empty)
   *
   * @param key - The environment variable name
   * @returns True if the variable exists
   *
   * @example
   * if (Env.has('OPTIONAL_FEATURE')) {
   *   // Enable optional feature
   * }
   */
  has(key: string): boolean {
    return key in process.env;
  },

  /**
   * Check if an environment variable is set and non-empty
   *
   * @param key - The environment variable name
   * @returns True if the variable is set with a non-empty value
   *
   * @example
   * if (Env.isSet('API_KEY')) {
   *   // Use API key
   * }
   */
  isSet(key: string): boolean {
    const value = process.env[key];
    return value !== undefined && value !== '';
  },

  /**
   * Get all environment variables
   *
   * @returns Object containing all environment variables
   *
   * @example
   * const allEnv = Env.all();
   * console.log('Environment variables:', Object.keys(allEnv));
   */
  all(): NodeJS.ProcessEnv {
    return process.env;
  },

  /**
   * Check if running in production environment
   *
   * @returns True if NODE_ENV is 'production'
   *
   * @example
   * if (Env.isProduction()) {
   *   // Production-only logic
   * }
   */
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },

  /**
   * Check if running in development environment
   *
   * @returns True if NODE_ENV is 'development'
   *
   * @example
   * if (Env.isDevelopment()) {
   *   // Development-only logging
   * }
   */
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  },

  /**
   * Check if running in test environment
   *
   * @returns True if NODE_ENV is 'test'
   *
   * @example
   * if (Env.isTesting()) {
   *   // Use test database
   * }
   */
  isTesting(): boolean {
    return process.env.NODE_ENV === 'test';
  },

  /**
   * Get the current environment name
   *
   * @param defaultEnv - Default environment if NODE_ENV is not set
   * @returns The environment name
   *
   * @example
   * const env = Env.getEnvironment('development');
   * console.log(`Running in ${env} mode`);
   */
  getEnvironment(defaultEnv: string = 'production'): string {
    return process.env.NODE_ENV ?? defaultEnv;
  },
};

// ============================================================================
// Legacy Exports (Deprecated)
// ============================================================================

/**
 * @deprecated Use Env.registerSchema() instead
 */
export const registerZodSchema = (schema: z.ZodSchema): void => {
  Env.registerSchema(schema);
};
