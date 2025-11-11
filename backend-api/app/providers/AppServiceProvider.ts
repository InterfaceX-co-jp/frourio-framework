/**
 * Application Service Provider
 *
 * Register application-specific services and commands here.
 * This is where you register your custom console commands.
 */

import type {
  Application,
  ServiceProvider,
} from '$/@frouvel/kaname/foundation';
import type { ConsoleKernel } from '$/@frouvel/kaname/foundation';

// Import your custom commands here
import { ExampleCommand } from '$/app/console/ExampleCommand';

export class AppServiceProvider implements ServiceProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  register(app: Application): void {
    // Register any application services here
    console.log('[AppServiceProvider] Application services registered');
  }

  async boot(app: Application): Promise<void> {
    // Register custom console commands
    const kernel = app.make<ConsoleKernel>('ConsoleKernel');

    // Register your commands here:
    kernel.registerCommands([
      new ExampleCommand(app),
      // Add more commands here as needed
    ]);

    console.log('[AppServiceProvider] Application services booted');
  }
}
