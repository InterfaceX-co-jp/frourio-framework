/**
 * Configuration Helper
 *
 * Laravel-like config() helper function to access configuration values.
 * Supports both dot notation and direct property access with full type inference.
 */

import app from '$/bootstrap/app';
import type { Config, ConfigPaths } from '$/config/$types';

/**
 * Get a configuration value using dot notation with autocomplete
 *
 * @example
 * config('app') // autocomplete: 'app' | 'admin' | 'cors' | 'database' | 'jwt'
 * config('app.name') // type: any (use configObject for full type safety)
 * config('database.pool.max') // type: any
 * config('non.existent.key', 'default') // Returns 'default'
 */
export function config<T = any>(
  key: ConfigPaths | string,
  defaultValue?: T,
): T {
  const configs = app.make<Record<string, any>>('config');

  const keys = (key as string).split('.');
  let value: any = configs;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue as T;
    }
  }

  return value as T;
}

/**
 * Check if a configuration key exists
 */
export function hasConfig(key: ConfigPaths | string): boolean {
  try {
    const configs = app.make<Record<string, any>>('config');
    const keys = (key as string).split('.');
    let value: any = configs;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get all configuration values for a specific file with autocomplete
 */
export function configAll<K extends keyof Config>(file: K): Config[K];
export function configAll(file: string): Record<string, any> | undefined;
export function configAll(file: string): Record<string, any> | undefined {
  const configs = app.make<Record<string, any>>('config');
  return configs[file];
}

/**
 * Create a deep proxy for configuration access
 */
function createConfigProxy(target: any, path: string[] = []): any {
  return new Proxy(target, {
    get(obj, prop: string) {
      const currentPath = [...path, prop];
      const value = obj[prop];

      // If value is an object, return a proxy to allow chaining
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return createConfigProxy(value, currentPath);
      }

      return value;
    },
  });
}

/**
 * Configuration object with type-safe property access
 *
 * @example
 * configObject.app.name // Returns app name with type inference
 * configObject.app.debug // Returns boolean with type inference
 * configObject.jwt.secret // Returns JWT secret with type inference
 */
export const configObject: Config = new Proxy({} as Config, {
  get(_target, prop: string) {
    const configs = app.make<Record<string, any>>('config');
    const value = configs[prop];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return createConfigProxy(value, [prop]);
    }

    return value;
  },
});
