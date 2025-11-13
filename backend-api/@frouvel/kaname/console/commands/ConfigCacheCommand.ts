/**
 * Config Cache Command
 *
 * Creates a cache file for faster configuration loading.
 * Similar to Laravel's `php artisan config:cache`
 */

import { Command, type CommandSignature } from '../Command';
import { LoadConfiguration } from '../../foundation/bootstrappers/LoadConfiguration';

export class ConfigCacheCommand extends Command {
  protected signature(): CommandSignature {
    return {
      name: 'config:cache',
      description: 'Create a cache file for faster configuration loading',
    };
  }

  async handle(): Promise<void> {
    try {
      this.info('Caching configuration...');

      // Cache the configuration
      await LoadConfiguration.cacheConfig(this.app);

      this.success('Configuration cached successfully!');
    } catch (error) {
      this.error(
        `Failed to cache configuration: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}