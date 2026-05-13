/**
 * Bootstrapper Interface
 * 
 * Defines the contract for application bootstrappers.
 * Each bootstrapper is responsible for a specific part of the application initialization.
 */

import type { Application } from './Application';

export interface Bootstrapper {
  /**
   * Bootstrap the given application
   */
  bootstrap(app: Application): void | Promise<void>;
}