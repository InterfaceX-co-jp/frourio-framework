/**
 * Boot Providers Bootstrapper
 * 
 * Boots all registered service providers.
 * This happens after all providers have been registered.
 */

import type { Bootstrapper } from '../Bootstrapper.interface';
import type { Application } from '../Application';

export class BootProviders implements Bootstrapper {
  async bootstrap(app: Application): Promise<void> {
    // Boot the application which will call boot() on all registered providers
    await app.boot();

    console.log('[Bootstrap] Service providers booted');
  }
}