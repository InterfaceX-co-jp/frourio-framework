/**
 * Load Environment Variables Bootstrapper
 *
 * Loads environment variables from .env file using dotenv.
 * This is typically the first bootstrapper to run.
 */

import { config } from 'dotenv';
import type { Bootstrapper } from '../Bootstrapper.interface';
import type { Application } from '../Application';

export class LoadEnvironmentVariables implements Bootstrapper {
  bootstrap(app: Application): void {
    // Load .env file if not in production or if explicitly needed
    // In production, environment variables are usually set by the platform
    const envPath = app.basePath('.env');

    config({ path: envPath });

    console.log(`[Bootstrap] Environment variables loaded from ${envPath}`);
  }
}
