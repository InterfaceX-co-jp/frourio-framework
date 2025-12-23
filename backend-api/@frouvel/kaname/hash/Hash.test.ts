import { describe, test, expect, beforeEach } from 'vitest';
import { Hash, hashPassword, verifyPassword } from './Hash';
import { BcryptHashStrategy } from './strategy/BcryptHashStrategy';
import type { IHashStrategy } from './strategy/HashStrategy.interface';

// Mock strategy for testing
class MockHashStrategy implements IHashStrategy {
  async make(password: string): Promise<string> {
    return `mock_${password}`;
  }

  async check(password: string, hash: string): Promise<boolean> {
    return hash === `mock_${password}`;
  }

  getName(): string {
    return 'mock';
  }
}

describe('Hash Facade', () => {
  const testPassword = 'testPassword123';

  // Reset to default strategy before each test
  beforeEach(() => {
    Hash.setStrategy(new BcryptHashStrategy());
  });

  describe('Hash.make()', () => {
    test('should hash a password successfully', async () => {
      const hashed = await Hash.make(testPassword);
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(testPassword);
      expect(hashed.length).toBeGreaterThan(0);
    });

    test('should create different hashes for same password', async () => {
      const hash1 = await Hash.make(testPassword);
      const hash2 = await Hash.make(testPassword);
      expect(hash1).not.toBe(hash2);
    });

    test('should accept custom rounds option', async () => {
      const hashedDefault = await Hash.make(testPassword);
      const hashedCustom = await Hash.make(testPassword, { rounds: 12 });
      expect(hashedDefault).toBeDefined();
      expect(hashedCustom).toBeDefined();
      expect(hashedDefault).not.toBe(hashedCustom);
    });
  });

  describe('Hash.check()', () => {
    test('should verify correct password', async () => {
      const hashed = await Hash.make(testPassword);
      const isValid = await Hash.check(testPassword, hashed);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const hashed = await Hash.make(testPassword);
      const isValid = await Hash.check('wrongPassword', hashed);
      expect(isValid).toBe(false);
    });

    test('should handle empty password', async () => {
      const hashed = await Hash.make('');
      const isValid = await Hash.check('', hashed);
      expect(isValid).toBe(true);
    });
  });

  describe('Hash.verify()', () => {
    test('should verify correct password (alias)', async () => {
      const hashed = await Hash.make(testPassword);
      const isValid = await Hash.verify(testPassword, hashed);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password (alias)', async () => {
      const hashed = await Hash.make(testPassword);
      const isValid = await Hash.verify('wrongPassword', hashed);
      expect(isValid).toBe(false);
    });
  });

  describe('Legacy functions (deprecated)', () => {
    test('hashPassword should still work', async () => {
      const hashed = await hashPassword({ password: testPassword });
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(testPassword);
    });

    test('verifyPassword should still work', async () => {
      const hashed = await hashPassword({ password: testPassword });
      const isValid = await verifyPassword({
        password: testPassword,
        passwordHash: hashed,
      });
      expect(isValid).toBe(true);
    });
  });

  describe('Strategy Pattern', () => {
    test('should use bcrypt strategy by default', () => {
      const strategyName = Hash.getStrategyName();
      expect(strategyName).toBe('bcrypt');
    });

    test('should allow setting custom strategy', () => {
      const mockStrategy = new MockHashStrategy();
      Hash.setStrategy(mockStrategy);
      expect(Hash.getStrategyName()).toBe('mock');
    });

    test('should hash with custom strategy', async () => {
      const mockStrategy = new MockHashStrategy();
      Hash.setStrategy(mockStrategy);

      const hashed = await Hash.make(testPassword);
      expect(hashed).toBe(`mock_${testPassword}`);
    });

    test('should verify with custom strategy', async () => {
      const mockStrategy = new MockHashStrategy();
      Hash.setStrategy(mockStrategy);

      const hashed = await Hash.make(testPassword);
      const isValid = await Hash.check(testPassword, hashed);
      expect(isValid).toBe(true);
    });

    test('should get current strategy instance', () => {
      const strategy = Hash.getStrategy();
      expect(strategy).toBeInstanceOf(BcryptHashStrategy);
      expect(strategy.getName()).toBe('bcrypt');
    });

    test('should switch between strategies', async () => {
      // Start with bcrypt
      expect(Hash.getStrategyName()).toBe('bcrypt');

      // Switch to mock
      Hash.setStrategy(new MockHashStrategy());
      const mockHashed = await Hash.make(testPassword);
      expect(Hash.getStrategyName()).toBe('mock');
      expect(mockHashed).toBe(`mock_${testPassword}`);

      // Switch back to bcrypt
      Hash.setStrategy(new BcryptHashStrategy());
      expect(Hash.getStrategyName()).toBe('bcrypt');
    });
  });

  describe('BcryptHashStrategy', () => {
    test('should support custom rounds in constructor', async () => {
      const strategy = new BcryptHashStrategy({ rounds: 4 });
      Hash.setStrategy(strategy);

      const hashed = await Hash.make(testPassword);
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(testPassword);
    });

    test('should support custom rounds in make()', async () => {
      const hashed = await Hash.make(testPassword, { rounds: 4 });
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(testPassword);
    });
  });

  describe('End-to-end workflow', () => {
    test('should hash and verify in typical usage pattern', async () => {
      // Simulate user registration
      const userPassword = 'mySecurePassword123!';
      const hashedPassword = await Hash.make(userPassword);

      // Simulate user login
      const loginPassword = 'mySecurePassword123!';
      const isAuthenticated = await Hash.check(loginPassword, hashedPassword);

      expect(isAuthenticated).toBe(true);
    });

    test('should reject wrong password in login scenario', async () => {
      const userPassword = 'mySecurePassword123!';
      const hashedPassword = await Hash.make(userPassword);

      const wrongPassword = 'wrongPassword';
      const isAuthenticated = await Hash.check(wrongPassword, hashedPassword);

      expect(isAuthenticated).toBe(false);
    });
  });
});
