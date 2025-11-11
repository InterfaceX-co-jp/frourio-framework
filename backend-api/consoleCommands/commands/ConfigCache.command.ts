/**
 * Config Cache Command
 *
 * Caches the application configuration for improved performance.
 * Similar to Laravel's `php artisan config:cache`
 */

import { Command } from 'commander';
import type { ICommandLineInterface } from './Command.interface';
import app from '$/bootstrap/app';
import { LoadConfiguration } from '$/@frouvel/kaname/foundation/bootstrappers/LoadConfiguration';
import type { ConsoleKernel } from '$/@frouvel/kaname/foundation/ConsoleKernel';

export class ConfigCacheCommand implements ICommandLineInterface {
  private constructor() {}

  static create(): ConfigCacheCommand {
    return new ConfigCacheCommand();
  }

  getCommand(): Command {
    const command = new Command('config:cache');

    command
      .description('Create a cache file for faster configuration loading')
      .action(() => {
        this.execute();
      });

    return command;
  }

  private async execute(): Promise<void> {
    try {
      console.log('Caching configuration...');

      // Bootstrap the application to load all configurations
      const kernel = app.make<ConsoleKernel>('ConsoleKernel');
      await kernel.bootstrap();

      // Cache the configuration
      await LoadConfiguration.cacheConfig(app);

      console.log('✓ Configuration cached successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Failed to cache configuration:', error);
      process.exit(1);
    }
  }
}
