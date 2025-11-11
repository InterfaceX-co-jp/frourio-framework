/**
 * Config Clear Command
 * 
 * Removes the configuration cache file.
 * Similar to Laravel's `php artisan config:clear`
 */

import { Command } from 'commander';
import type { ICommandLineInterface } from './Command.interface';
import app from '$/bootstrap/app';
import { LoadConfiguration } from '$/@frouvel/kaname/foundation/bootstrappers/LoadConfiguration';

export class ConfigClearCommand implements ICommandLineInterface {
  private constructor() {}

  static create(): ConfigClearCommand {
    return new ConfigClearCommand();
  }

  getCommand(): Command {
    const command = new Command('config:clear');

    command
      .description('Remove the configuration cache file')
      .action(() => {
        this.execute();
      });

    return command;
  }

  private execute(): void {
    try {
      console.log('Clearing configuration cache...');

      LoadConfiguration.clearCache(app);

      console.log('✓ Configuration cache cleared successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Failed to clear configuration cache:', error);
      process.exit(1);
    }
  }
}