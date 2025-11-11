/**
 * Register Providers Bootstrapper
 *
 * Registers all service providers with the application container.
 * Service providers are the central place for application bootstrapping.
 */

import type { Bootstrapper } from '../Bootstrapper.interface';
import type { Application, ServiceProvider } from '../Application';

export class RegisterProviders implements Bootstrapper {
  async bootstrap(app: Application): Promise<void> {
    // Get providers from configuration or define them here
    const providers = this.getProviders(app);

    // Register each provider
    for (const Provider of providers) {
      const provider = new Provider();
      app.register(provider);
    }

    console.log(`[Bootstrap] Registered ${providers.length} service providers`);
  }

  /**
   * Get the service providers to register
   * In a real application, this might come from a config file
   */
  private getProviders(_app: Application): Array<new () => ServiceProvider> {
    // Service providers should be registered in the application's bootstrap/app.ts
    // This method can be overridden in your application's custom RegisterProviders
    return [];
  }
}
