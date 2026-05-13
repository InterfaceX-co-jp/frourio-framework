/**
 * Hash Module
 *
 * Provides a unified API for password hashing operations.
 * Inspired by Laravel's Hash facade.
 * Supports multiple hashing strategies via Strategy Pattern.
 *
 * @example
 * // Hash a password (using default bcrypt strategy)
 * const hashed = await Hash.make('secret123');
 *
 * // Verify a password
 * const isValid = await Hash.check('secret123', hashed);
 *
 * @example
 * // Use custom strategy
 * import { Argon2HashStrategy } from '$/@frouvel/kaname/hash/strategies/Argon2HashStrategy';
 * Hash.setStrategy(new Argon2HashStrategy());
 * const hashed = await Hash.make('secret123');
 */

import type {
  IHashStrategy,
  HashStrategyOptions,
} from './strategy/HashStrategy.interface';
import { BcryptHashStrategy } from './strategy/BcryptHashStrategy';

// ============================================================================
// Strategy Management
// ============================================================================

/**
 * Current hash strategy instance
 * @internal
 */
let currentStrategy: IHashStrategy = new BcryptHashStrategy();

// ============================================================================
// Hash Facade
// ============================================================================

/**
 * Hash facade providing password hashing operations with strategy pattern support
 */
export const Hash = {
  /**
   * Hash a password using the current strategy
   *
   * @param password - The password to hash
   * @param options - Strategy-specific hashing options
   * @returns Promise resolving to the hashed password
   *
   * @example
   * // Using default bcrypt strategy
   * const hashed = await Hash.make('mypassword');
   *
   * @example
   * // With bcrypt options
   * const customRounds = await Hash.make('mypassword', { rounds: 12 });
   */
  make: async (
    password: string,
    options?: HashStrategyOptions,
  ): Promise<string> => {
    return currentStrategy.make(password, options);
  },

  /**
   * Verify a password against its hash using the current strategy
   *
   * @param password - The plain text password
   * @param hash - The hashed password to compare against
   * @returns Promise resolving to true if password matches, false otherwise
   *
   * @example
   * const isValid = await Hash.check('mypassword', hashedPassword);
   * if (isValid) {
   *   // Password is correct
   * }
   */
  check: async (password: string, hash: string): Promise<boolean> => {
    return currentStrategy.check(password, hash);
  },

  /**
   * Alias for check() - verify a password against its hash
   * Provides alternative naming for better code readability
   *
   * @param password - The plain text password
   * @param hash - The hashed password to compare against
   * @returns Promise resolving to true if password matches, false otherwise
   *
   * @example
   * const isValid = await Hash.verify('mypassword', hashedPassword);
   */
  verify: async (password: string, hash: string): Promise<boolean> => {
    return currentStrategy.check(password, hash);
  },

  /**
   * Set the hashing strategy to use
   *
   * @param strategy - The hash strategy instance to use
   *
   * @example
   * import { Argon2HashStrategy } from '$/@frouvel/kaname/hash/strategies/Argon2HashStrategy';
   * Hash.setStrategy(new Argon2HashStrategy());
   *
   * @example
   * // Switch back to bcrypt with custom rounds
   * import { BcryptHashStrategy } from '$/@frouvel/kaname/hash/strategies/BcryptHashStrategy';
   * Hash.setStrategy(new BcryptHashStrategy({ rounds: 12 }));
   */
  setStrategy: (strategy: IHashStrategy): void => {
    currentStrategy = strategy;
  },

  /**
   * Get the current hashing strategy
   *
   * @returns The current hash strategy instance
   *
   * @example
   * const strategy = Hash.getStrategy();
   * console.log(strategy.getName()); // 'bcrypt'
   */
  getStrategy: (): IHashStrategy => {
    return currentStrategy;
  },

  /**
   * Get the name of the current hashing strategy
   *
   * @returns The name of the current strategy
   *
   * @example
   * console.log(Hash.getStrategyName()); // 'bcrypt'
   */
  getStrategyName: (): string => {
    return currentStrategy.getName();
  },
};

// ============================================================================
// Legacy Exports (Deprecated)
// ============================================================================

/**
 * @deprecated Use Hash.make() instead
 */
export const hashPassword = async ({ password }: { password: string }) => {
  return Hash.make(password);
};

/**
 * @deprecated Use Hash.check() or Hash.verify() instead
 */
export const verifyPassword = async ({
  passwordHash,
  password,
}: {
  passwordHash: string;
  password: string;
}) => {
  return Hash.check(password, passwordHash);
};
