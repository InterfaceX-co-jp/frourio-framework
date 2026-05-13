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
  readdirSync,
} from 'fs';
import { join, extname, basename } from 'path';
import type { Bootstrapper } from '../Bootstrapper.interface';
import type { Application } from '../Application';
import { ConfigTypesGenerator } from '../../generator/ConfigTypesGenerator';

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

    // Auto-discover all config files in the config directory
    if (!existsSync(configPath)) {
      console.warn(`[Bootstrap] Config directory not found: ${configPath}`);
      app.singleton('config', () => configs);
      return;
    }

    const files = readdirSync(configPath);

    // Filter for .ts files (excluding .d.ts, test files, and $types.ts)
    const configFiles = files
      .filter((file) => {
        const ext = extname(file);
        const baseName = basename(file, '.ts');
        return (
          ext === '.ts' &&
          !file.endsWith('.d.ts') &&
          !file.endsWith('.test.ts') &&
          !file.endsWith('.spec.ts') &&
          baseName !== 'README' &&
          baseName !== '$types'
        );
      })
      .map((file) => basename(file, '.ts'));

    console.log(
      `[Bootstrap] Discovered ${configFiles.length} config files: ${configFiles.join(', ')}`,
    );

    // Auto-generate types.ts file using generator
    const generator = new ConfigTypesGenerator(configPath);
    await generator.execute();

    // Dynamically import all discovered config files
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
