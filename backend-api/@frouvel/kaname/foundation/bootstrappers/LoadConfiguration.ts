/**
 * Load Configuration Bootstrapper
 *
 * Loads configuration files from the config directory.
 * Supports configuration caching for better performance in production.
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';
import type { Bootstrapper } from '../Bootstrapper.interface';
import type { Application } from '../Application';

export class LoadConfiguration implements Bootstrapper {
  private readonly _cacheFileName = 'config.cache.json';

  async bootstrap(app: Application): Promise<void> {
    const cachePath = join(app.bootstrapPath(), this._cacheFileName);

    // Try to load from cache first in production
    if (app.isProduction() && existsSync(cachePath)) {
      await this.loadFromCache(app, cachePath);
      console.log('[Bootstrap] Configuration loaded from cache');
      return;
    }

    // Load configuration from files
    await this.loadFromFiles(app);
    console.log('[Bootstrap] Configuration loaded from files');
  }

  private async loadFromCache(
    app: Application,
    cachePath: string,
  ): Promise<void> {
    try {
      const cached = JSON.parse(readFileSync(cachePath, 'utf-8'));
      app.singleton('config', () => cached);
    } catch (error) {
      console.warn(
        '[Bootstrap] Failed to load config cache, falling back to files:',
        error,
      );
      await this.loadFromFiles(app);
    }
  }

  private async loadFromFiles(app: Application): Promise<void> {
    const configPath = app.configPath();
    const configs: Record<string, any> = {};

    // Dynamically import all config files
    const configFiles = ['admin', 'cors', 'jwt'];

    for (const file of configFiles) {
      try {
        const configModule = await import(join(configPath, `${file}.ts`));
        configs[file] = configModule.default || configModule;
      } catch (error) {
        console.warn(
          `[Bootstrap] Failed to load config file: ${file}.ts`,
          error,
        );
      }
    }

    app.singleton('config', () => configs);
  }

  /**
   * Cache the current configuration to disk
   * This should be called during deployment or build process
   */
  static async cacheConfig(app: Application): Promise<void> {
    const cachePath = join(
      app.bootstrapPath(),
      new LoadConfiguration()._cacheFileName,
    );
    const cacheDir = app.bootstrapPath();

    // Ensure cache directory exists
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    const config = app.make<Record<string, any>>('config');
    writeFileSync(cachePath, JSON.stringify(config, null, 2), 'utf-8');

    console.log(`[Bootstrap] Configuration cached to ${cachePath}`);
  }

  /**
   * Clear the configuration cache
   */
  static clearCache(app: Application): void {
    const cachePath = join(
      app.bootstrapPath(),
      new LoadConfiguration()._cacheFileName,
    );

    if (existsSync(cachePath)) {
      unlinkSync(cachePath);
      console.log('[Bootstrap] Configuration cache cleared');
    }
  }
}
