/* eslint-disable max-lines */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { Env } from './Env';

describe('Env Facade', () => {
  // Store original environment
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe('Env.get()', () => {
    test('should get existing environment variable', () => {
      process.env.TEST_VAR = 'test_value';
      const value = Env.get('TEST_VAR');
      expect(value).toBe('test_value');
    });

    test('should return default value when variable does not exist', () => {
      const value = Env.get('NON_EXISTENT', 'default');
      expect(value).toBe('default');
    });

    test('should return undefined when variable does not exist and no default', () => {
      const value = Env.get('NON_EXISTENT');
      expect(value).toBeUndefined();
    });

    test('should prefer environment value over default', () => {
      process.env.TEST_VAR = 'actual';
      const value = Env.get('TEST_VAR', 'default');
      expect(value).toBe('actual');
    });
  });

  describe('Env.getOrFail()', () => {
    test('should return value when variable exists', () => {
      process.env.REQUIRED_VAR = 'value';
      const value = Env.getOrFail('REQUIRED_VAR');
      expect(value).toBe('value');
    });

    test('should throw when variable does not exist', () => {
      expect(() => Env.getOrFail('MISSING_VAR')).toThrow(
        'Environment variable [MISSING_VAR] is required but not set',
      );
    });

    test('should throw when variable is empty string', () => {
      process.env.EMPTY_VAR = '';
      expect(() => Env.getOrFail('EMPTY_VAR')).toThrow(
        'Environment variable [EMPTY_VAR] is required but not set',
      );
    });
  });

  describe('Env.getBoolean()', () => {
    test('should recognize truthy values', () => {
      const truthyValues = ['true', 'TRUE', '1', 'yes', 'YES', 'on', 'ON'];
      truthyValues.forEach((value) => {
        process.env.BOOL_VAR = value;
        expect(Env.getBoolean('BOOL_VAR')).toBe(true);
      });
    });

    test('should recognize falsy values', () => {
      const falsyValues = ['false', 'FALSE', '0', 'no', 'NO', 'off', 'OFF'];
      falsyValues.forEach((value) => {
        process.env.BOOL_VAR = value;
        expect(Env.getBoolean('BOOL_VAR')).toBe(false);
      });
    });

    test('should return default for non-boolean values', () => {
      process.env.BOOL_VAR = 'maybe';
      expect(Env.getBoolean('BOOL_VAR', true)).toBe(true);
      expect(Env.getBoolean('BOOL_VAR', false)).toBe(false);
    });

    test('should return default when variable does not exist', () => {
      expect(Env.getBoolean('NON_EXISTENT', true)).toBe(true);
      expect(Env.getBoolean('NON_EXISTENT', false)).toBe(false);
    });

    test('should handle whitespace', () => {
      process.env.BOOL_VAR = '  true  ';
      expect(Env.getBoolean('BOOL_VAR')).toBe(true);
    });
  });

  describe('Env.getInt()', () => {
    test('should parse valid integer', () => {
      process.env.INT_VAR = '42';
      expect(Env.getInt('INT_VAR')).toBe(42);
    });

    test('should parse negative integer', () => {
      process.env.INT_VAR = '-10';
      expect(Env.getInt('INT_VAR')).toBe(-10);
    });

    test('should return default for invalid integer', () => {
      process.env.INT_VAR = 'not_a_number';
      expect(Env.getInt('INT_VAR', 100)).toBe(100);
    });

    test('should return default when variable does not exist', () => {
      expect(Env.getInt('NON_EXISTENT', 50)).toBe(50);
    });

    test('should truncate float to integer', () => {
      process.env.INT_VAR = '42.7';
      expect(Env.getInt('INT_VAR')).toBe(42);
    });
  });

  describe('Env.getFloat()', () => {
    test('should parse valid float', () => {
      process.env.FLOAT_VAR = '3.14';
      expect(Env.getFloat('FLOAT_VAR')).toBe(3.14);
    });

    test('should parse negative float', () => {
      process.env.FLOAT_VAR = '-2.5';
      expect(Env.getFloat('FLOAT_VAR')).toBe(-2.5);
    });

    test('should parse integer as float', () => {
      process.env.FLOAT_VAR = '42';
      expect(Env.getFloat('FLOAT_VAR')).toBe(42);
    });

    test('should return default for invalid float', () => {
      process.env.FLOAT_VAR = 'not_a_number';
      expect(Env.getFloat('FLOAT_VAR', 1.5)).toBe(1.5);
    });

    test('should return default when variable does not exist', () => {
      expect(Env.getFloat('NON_EXISTENT', 0.5)).toBe(0.5);
    });
  });

  describe('Env.getJson()', () => {
    test('should parse valid JSON object', () => {
      process.env.JSON_VAR = '{"key":"value","num":42}';
      const result = Env.getJson('JSON_VAR');
      expect(result).toEqual({ key: 'value', num: 42 });
    });

    test('should parse valid JSON array', () => {
      process.env.JSON_VAR = '[1,2,3]';
      const result = Env.getJson('JSON_VAR');
      expect(result).toEqual([1, 2, 3]);
    });

    test('should return default for invalid JSON', () => {
      process.env.JSON_VAR = 'not valid json';
      const defaultValue = { default: true };
      const result = Env.getJson('JSON_VAR', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    test('should return default when variable does not exist', () => {
      const defaultValue = { config: 'default' };
      const result = Env.getJson('NON_EXISTENT', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    test('should handle typed parsing', () => {
      interface Config {
        feature: string;
        enabled: boolean;
      }
      process.env.JSON_VAR = '{"feature":"test","enabled":true}';
      const result = Env.getJson<Config>('JSON_VAR');
      expect(result?.feature).toBe('test');
      expect(result?.enabled).toBe(true);
    });
  });

  describe('Env.has()', () => {
    test('should return true for existing variable', () => {
      process.env.EXISTS = 'value';
      expect(Env.has('EXISTS')).toBe(true);
    });

    test('should return true even for empty string', () => {
      process.env.EMPTY = '';
      expect(Env.has('EMPTY')).toBe(true);
    });

    test('should return false for non-existent variable', () => {
      expect(Env.has('NON_EXISTENT')).toBe(false);
    });
  });

  describe('Env.isSet()', () => {
    test('should return true for non-empty variable', () => {
      process.env.SET_VAR = 'value';
      expect(Env.isSet('SET_VAR')).toBe(true);
    });

    test('should return false for empty string', () => {
      process.env.EMPTY_VAR = '';
      expect(Env.isSet('EMPTY_VAR')).toBe(false);
    });

    test('should return false for non-existent variable', () => {
      expect(Env.isSet('NON_EXISTENT')).toBe(false);
    });
  });

  describe('Env.all()', () => {
    test('should return all environment variables', () => {
      process.env.TEST1 = 'value1';
      process.env.TEST2 = 'value2';
      const all = Env.all();
      expect(all.TEST1).toBe('value1');
      expect(all.TEST2).toBe('value2');
    });
  });

  describe('Environment Detection', () => {
    describe('Env.isProduction()', () => {
      test('should return true when NODE_ENV is production', () => {
        process.env.NODE_ENV = 'production';
        expect(Env.isProduction()).toBe(true);
      });

      test('should return false when NODE_ENV is not production', () => {
        process.env.NODE_ENV = 'development';
        expect(Env.isProduction()).toBe(false);
      });
    });

    describe('Env.isDevelopment()', () => {
      test('should return true when NODE_ENV is development', () => {
        process.env.NODE_ENV = 'development';
        expect(Env.isDevelopment()).toBe(true);
      });

      test('should return false when NODE_ENV is not development', () => {
        process.env.NODE_ENV = 'production';
        expect(Env.isDevelopment()).toBe(false);
      });
    });

    describe('Env.isTesting()', () => {
      test('should return true when NODE_ENV is test', () => {
        process.env.NODE_ENV = 'test';
        expect(Env.isTesting()).toBe(true);
      });

      test('should return false when NODE_ENV is not test', () => {
        process.env.NODE_ENV = 'production';
        expect(Env.isTesting()).toBe(false);
      });
    });

    describe('Env.getEnvironment()', () => {
      test('should return NODE_ENV value', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        process.env.NODE_ENV = 'staging';
        expect(Env.getEnvironment()).toBe('staging');
      });

      test('should return default when NODE_ENV is not set', () => {
        process.env.NODE_ENV = undefined as any;
        expect(Env.getEnvironment('development')).toBe('development');
      });

      test('should use production as default when no default provided', () => {
        process.env.NODE_ENV = undefined as any;
        expect(Env.getEnvironment()).toBe('production');
      });
    });
  });

  describe('Schema Validation', () => {
    test('should validate valid environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';
      process.env.API_KEY = 'test-key';

      const schema = z.object({
        NODE_ENV: z.enum(['development', 'production', 'test']),
        PORT: z.string(),
        API_KEY: z.string().min(1),
      });

      // Should not throw
      Env.registerSchema(schema, { exitOnError: false });
      expect(Env.isValidated()).toBe(true);
    });

    test('should handle invalid environment', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      process.env.NODE_ENV = 'invalid';

      const schema = z.object({
        NODE_ENV: z.enum(['development', 'production', 'test']),
      });

      let errorCalled = false;
      Env.registerSchema(schema, {
        exitOnError: false,
        onError: () => {
          errorCalled = true;
        },
      });

      expect(errorCalled).toBe(true);
      expect(Env.isValidated()).toBe(false);
    });

    test('should store registered schema', () => {
      const schema = z.object({
        TEST: z.string(),
      });

      Env.registerSchema(schema, { exitOnError: false });
      expect(Env.getSchema()).toBe(schema);
    });

    test('should call custom error handler', () => {
      process.env.MISSING_REQUIRED = undefined;

      const schema = z.object({
        MISSING_REQUIRED: z.string(),
      });

      let capturedError: z.ZodError | null = null;
      Env.registerSchema(schema, {
        exitOnError: false,
        onError: (error) => {
          capturedError = error;
        },
      });

      expect(capturedError).toBeInstanceOf(z.ZodError);
    });
  });

  describe('End-to-end workflow', () => {
    test('should handle typical application configuration', () => {
      // Set up test environment
      process.env.NODE_ENV = 'development';
      process.env.API_PORT = '8080';
      process.env.DATABASE_URL = 'postgresql://localhost/test';
      process.env.DEBUG = 'true';
      process.env.MAX_CONNECTIONS = '100';
      process.env.TIMEOUT = '30.5';

      // Define schema
      const schema = z.object({
        NODE_ENV: z.enum(['development', 'production', 'test']),
        API_PORT: z.string(),
        DATABASE_URL: z.string().url(),
        DEBUG: z.string().optional(),
        MAX_CONNECTIONS: z.string().optional(),
        TIMEOUT: z.string().optional(),
      });

      // Validate
      Env.registerSchema(schema, { exitOnError: false });
      expect(Env.isValidated()).toBe(true);

      // Use configuration
      const config = {
        port: Env.getInt('API_PORT', 3000),
        dbUrl: Env.getOrFail('DATABASE_URL'),
        isDebug: Env.getBoolean('DEBUG', false),
        maxConnections: Env.getInt('MAX_CONNECTIONS', 50),
        timeout: Env.getFloat('TIMEOUT', 30.0),
        isDevelopment: Env.isDevelopment(),
      };

      expect(config.port).toBe(8080);
      expect(config.dbUrl).toBe('postgresql://localhost/test');
      expect(config.isDebug).toBe(true);
      expect(config.maxConnections).toBe(100);
      expect(config.timeout).toBe(30.5);
      expect(config.isDevelopment).toBe(true);
    });

    test('should handle missing required variables gracefully', () => {
      const schema = z.object({
        REQUIRED_API_KEY: z.string().min(32),
      });

      let validationFailed = false;
      Env.registerSchema(schema, {
        exitOnError: false,
        onError: () => {
          validationFailed = true;
        },
      });

      expect(validationFailed).toBe(true);
      expect(Env.isValidated()).toBe(false);
    });
  });
});
