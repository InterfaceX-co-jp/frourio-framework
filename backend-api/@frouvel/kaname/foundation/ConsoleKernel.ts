/**
 * Console Kernel
 *
 * Handles console commands and manages the application lifecycle for CLI requests.
 * Bootstraps the application for console commands.
 */

import { Kernel } from './Kernel';
import type { Bootstrapper } from './Bootstrapper.interface';
import {
  LoadEnvironmentVariables,
  LoadConfiguration,
  HandleExceptions,
  RegisterProviders,
  BootProviders,
} from './bootstrappers';

export class ConsoleKernel extends Kernel {
  /**
   * Get the bootstrappers for console commands
   */
  protected getBootstrappers(): Array<new () => Bootstrapper> {
    return [
      LoadEnvironmentVariables,
      LoadConfiguration,
      HandleExceptions,
      RegisterProviders,
      BootProviders,
    ];
  }

  /**
   * Handle a console command
   */
  async handle(command: string, args: string[] = []): Promise<void> {
    // Bootstrap the application
    await this.bootstrap();

    console.log(`[ConsoleKernel] Executing command: ${command}`);

    // Command execution logic would go here
    // This is where you would integrate with Commander.js or your CLI framework
  }

  /**
   * Call a console command programmatically
   */
  async call(
    command: string,
    parameters: Record<string, any> = {},
  ): Promise<void> {
    await this.bootstrap();

    // Execute command with parameters
    console.log(`[ConsoleKernel] Calling command: ${command}`, parameters);
  }
}
