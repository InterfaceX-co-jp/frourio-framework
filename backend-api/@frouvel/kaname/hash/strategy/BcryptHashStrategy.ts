/**
 * Bcrypt Hash Strategy
 *
 * Implementation of HashStrategy using bcrypt algorithm.
 * This is the default and recommended strategy for most applications.
 */

import bcrypt from 'bcryptjs';
import type { IHashStrategy, HashStrategyOptions } from './HashStrategy.interface';

export interface BcryptOptions extends HashStrategyOptions {
  /**
   * Number of rounds for bcrypt
   * @default 10
   */
  rounds?: number;
}

export class BcryptHashStrategy implements IHashStrategy {
  private readonly defaultRounds: number = 10;

  constructor(private readonly options?: BcryptOptions) {}

  async make(password: string, options?: BcryptOptions): Promise<string> {
    const rounds = options?.rounds ?? this.options?.rounds ?? this.defaultRounds;
    return await bcrypt.hash(password, rounds);
  }

  async check(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  getName(): string {
    return 'bcrypt';
  }
}