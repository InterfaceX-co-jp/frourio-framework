/**
 * Base Command Class
 *
 * Abstract base class for all console commands.
 * Inspired by Laravel's Illuminate\Console\Command
 */

import type { Application } from '../foundation/Application';
import type { Command as CommanderCommand } from 'commander';

export interface CommandSignature {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
    defaultValue?: any;
  }>;
  options?: Array<{
    flags: string;
    description?: string;
    defaultValue?: any;
  }>;
}

export abstract class Command {
  protected readonly app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  /**
   * The command signature
   */
  protected abstract signature(): CommandSignature;

  /**
   * Execute the console command
   */
  abstract handle(...args: any[]): Promise<void> | void;

  /**
   * Get the command signature
   */
  getSignature(): CommandSignature {
    return this.signature();
  }

  /**
   * Configure the Commander.js command
   */
  configure(command: CommanderCommand): void {
    const sig = this.signature();

    // Set description (name is already set by constructor)
    command.description(sig.description);

    // Add arguments
    if (sig.arguments) {
      sig.arguments.forEach((arg) => {
        const argStr = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
        command.argument(argStr, arg.description, arg.defaultValue);
      });
    }

    // Add options
    if (sig.options) {
      sig.options.forEach((opt) => {
        command.option(opt.flags, opt.description, opt.defaultValue);
      });
    }

    // Set action
    // Commander passes all arguments before options/command, so we don't use command.action's args
    // Instead, use command.action((options, command) => ...) for zero-arg commands
    // or command.action((arg1, arg2, ..., options, command) => ...) for commands with args
    const hasArguments = sig.arguments && sig.arguments.length > 0;
    
    if (!hasArguments) {
      // No arguments - just options
      command.action(async () => {
        try {
          await this.handle();
        } catch (error) {
          this.error(error instanceof Error ? error.message : String(error));
          process.exit(1);
        }
      });
    } else {
      // Has arguments
      command.action(async (...args: any[]) => {
        try {
          await this.handle(...args);
        } catch (error) {
          this.error(error instanceof Error ? error.message : String(error));
          process.exit(1);
        }
      });
    }
  }

  /**
   * Write info to console
   */
  protected info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  /**
   * Write warning to console
   */
  protected warn(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  /**
   * Write error to console
   */
  protected error(message: string): void {
    console.error(`❌ ${message}`);
  }

  /**
   * Write success to console
   */
  protected success(message: string): void {
    console.log(`✅ ${message}`);
  }

  /**
   * Write a blank line
   */
  protected newLine(count: number = 1): void {
    console.log('\n'.repeat(count - 1));
  }

  /**
   * Write a line to console
   */
  protected line(message: string): void {
    console.log(message);
  }

  /**
   * Write a comment to console
   */
  protected comment(message: string): void {
    console.log(`💬 ${message}`);
  }

  /**
   * Ask a question (placeholder - can be enhanced with inquirer)
   */
  protected async ask(question: string): Promise<string> {
    // Simple implementation - can be enhanced with inquirer.js
    console.log(`❓ ${question}`);
    return '';
  }

  /**
   * Ask a confirmation question
   */
  protected async confirm(question: string): Promise<boolean> {
    // Simple implementation - can be enhanced with inquirer.js
    console.log(`❓ ${question} (y/n)`);
    return false;
  }

  /**
   * Call another console command
   */
  protected async call(
    command: string,
    parameters: Record<string, any> = {},
  ): Promise<void> {
    const kernel = this.app.make<any>('ConsoleKernel');
    await kernel.call(command, parameters);
  }
}