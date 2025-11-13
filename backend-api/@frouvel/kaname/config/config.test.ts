/**
 * Configuration Helper Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the app module before importing config helpers
vi.mock('$/bootstrap/app', () => {
  const mockApp = {
    make: vi.fn((key: string) => {
      if (key === 'config') {
        return {
          app: {
            name: 'Test App',
            env: 'test',
            debug: true,
            nested: {
              value: 'deep value',
            },
          },
          database: {
            connections: {
              postgresql: {
                url: 'postgresql://test',
              },
            },
          },
        };
      }
      throw new Error(`Service [${key}] not found in container`);
    }),
  };
  return { default: mockApp };
});

import { config, hasConfig, configAll } from './config';

describe('Configuration Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('config()', () => {
    it('should get top-level config value', () => {
      const appName = config('app.name');
      expect(appName).toBe('Test App');
    });

    it('should get nested config value', () => {
      const dbUrl = config('database.connections.postgresql.url');
      expect(dbUrl).toBe('postgresql://test');
    });

    it('should get deeply nested value', () => {
      const nestedValue = config('app.nested.value');
      expect(nestedValue).toBe('deep value');
    });

    it('should return default value for non-existent key', () => {
      const value = config('non.existent.key', 'default');
      expect(value).toBe('default');
    });

    it('should return undefined for non-existent key without default', () => {
      const value = config('non.existent.key');
      expect(value).toBeUndefined();
    });

    it('should handle type parameter', () => {
      const debug = config<boolean>('app.debug');
      expect(typeof debug).toBe('boolean');
      expect(debug).toBe(true);
    });
  });

  describe('hasConfig()', () => {
    it('should return true for existing config', () => {
      expect(hasConfig('app.name')).toBe(true);
      expect(hasConfig('database.connections.postgresql.url')).toBe(true);
    });

    it('should return false for non-existing config', () => {
      expect(hasConfig('non.existent')).toBe(false);
      expect(hasConfig('app.non.existent')).toBe(false);
    });
  });

  describe('configAll()', () => {
    it('should get all config for a file', () => {
      const appConfig = configAll('app');
      expect(appConfig).toEqual({
        name: 'Test App',
        env: 'test',
        debug: true,
        nested: {
          value: 'deep value',
        },
      });
    });

    it('should return undefined for non-existent file', () => {
      const config = configAll('nonexistent');
      expect(config).toBeUndefined();
    });
  });
});
