/**
 * Config Clear Command
 *
 * Removes the configuration cache file.
 * Similar to Laravel's `php artisan config:clear`
 */

import { Command, type CommandSignature } from '../Command';
import { LoadConfiguration } from '../../foundation/bootstrappers/LoadConfiguration';

export class ConfigClearCommand extends Command {
  protected signature(): CommandSignature {
    return {
      name: 'config:clear',
      description: 'Remove the configuration cache file',
    };
  }

  handle(): void {
    try {
      this.info('Clearing configuration cache...');

      LoadConfiguration.clearCache(this.app);

      this.success('Configuration cache cleared successfully!');
    } catch (error) {
      this.error(
        `Failed to clear configuration cache: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}