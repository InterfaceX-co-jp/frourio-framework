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
import type { Command } from '../console/Command';
import { Command as CommanderCommand } from 'commander';

export class ConsoleKernel extends Kernel {
  private readonly _commands: Map<string, Command> = new Map();
  private _program: CommanderCommand | null = null;

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
   * Register a command
   */
  registerCommand(command: Command): void {
    const signature = command.getSignature();
    this._commands.set(signature.name, command);
  }

  /**
   * Register multiple commands
   */
  registerCommands(commands: Command[]): void {
    commands.forEach((command) => this.registerCommand(command));
  }

  /**
   * Get all registered commands
   */
  getCommands(): Map<string, Command> {
    return this._commands;
  }

  /**
   * Get the Commander program instance
   */
  getProgram(): CommanderCommand {
    if (!this._program) {
      this._program = new CommanderCommand();
      this._program
        .name('artisan')
        .description('frourio-framework Artisan Console')
        .version('1.0.0');
    }
    return this._program;
  }

  /**
   * Set the Commander program instance
   */
  setProgram(program: CommanderCommand): void {
    this._program = program;
  }

  /**
   * Build the Commander program with registered commands
   */
  buildProgram(): CommanderCommand {
    const program = this.getProgram();

    // Register all commands
    this._commands.forEach((command) => {
      const sig = command.getSignature();
      // Create command with name in constructor (required by Commander.js)
      const cmd = new CommanderCommand(sig.name);
      command.configure(cmd);
      program.addCommand(cmd);
    });

    return program;
  }

  /**
   * Handle a console command
   */
  async handle(command: string, args: string[] = []): Promise<void> {
    // Bootstrap the application
    await this.bootstrap();

    const cmd = this._commands.get(command);
    if (!cmd) {
      throw new Error(`Command [${command}] not found`);
    }

    await cmd.handle(...args);
  }

  /**
   * Call a console command programmatically
   */
  async call(
    command: string,
    parameters: Record<string, any> = {},
  ): Promise<void> {
    await this.bootstrap();

    const cmd = this._commands.get(command);
    if (!cmd) {
      throw new Error(`Command [${command}] not found`);
    }

    // Convert parameters to array of arguments
    const args = Object.values(parameters);
    await cmd.handle(...args);
  }

  /**
   * Run the console application
   */
  async run(argv: string[]): Promise<void> {
    await this.bootstrap();
    const program = this.buildProgram();
    await program.parseAsync(argv);
  }
}
