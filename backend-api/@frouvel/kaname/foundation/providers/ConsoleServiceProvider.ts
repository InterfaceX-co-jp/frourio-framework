/**
 * Console Service Provider
 *
 * Registers console commands with the application.
 */

import type {
  Application,
  ServiceProvider,
} from '$/@frouvel/kaname/foundation';
import type { ConsoleKernel } from '$/@frouvel/kaname/foundation';
import {
  ConfigCacheCommand,
  ConfigClearCommand,
  GenerateConfigTypesCommand,
  InspireCommand,
  GreetCommand,
  TinkerCommand,
} from '$/@frouvel/kaname/console/commands';

export class ConsoleServiceProvider implements ServiceProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  register(_app: Application): void {
    // Registration logic if needed
  }

  async boot(app: Application): Promise<void> {
    // Get the console kernel
    const kernel = app.make<ConsoleKernel>('ConsoleKernel');

    // Register built-in commands
    kernel.registerCommands([
      new ConfigCacheCommand(app),
      new ConfigClearCommand(app),
      new GenerateConfigTypesCommand(app),
      new InspireCommand(app),
      new GreetCommand(app),
      new TinkerCommand(app),
    ]);
  }
}
