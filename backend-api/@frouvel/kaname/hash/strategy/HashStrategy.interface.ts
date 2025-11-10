/**
 * Hash Strategy Interface
 *
 * Defines the contract for password hashing strategies.
 * Implementations can use different algorithms (bcrypt, argon2, scrypt, etc.)
 */

export interface HashStrategyOptions {
  [key: string]: any;
}

export interface IHashStrategy {
  /**
   * Hash a password
   * @param password - The password to hash
   * @param options - Strategy-specific options
   */
  make(password: string, options?: HashStrategyOptions): Promise<string>;

  /**
   * Verify a password against its hash
   * @param password - The plain text password
   * @param hash - The hashed password
   */
  check(password: string, hash: string): Promise<boolean>;

  /**
   * Get the name of this hashing strategy
   */
  getName(): string;
}