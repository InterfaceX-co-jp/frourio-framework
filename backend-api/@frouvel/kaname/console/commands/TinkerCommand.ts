/**
 * Tinker Command
 *
 * Interactive REPL for the application.
 * Similar to Laravel's `php artisan tinker`
 */

import { Command, type CommandSignature } from '../Command';
import * as repl from 'repl';
import { getPrismaClient } from '$/@frouvel/kaname/database';

export class TinkerCommand extends Command {
  protected signature(): CommandSignature {
    return {
      name: 'tinker',
      description: 'Interact with your application',
    };
  }

  async handle(): Promise<void> {
    this.info('Starting Tinker REPL...');
    this.comment('Type .help for available commands, .exit to quit');
    this.newLine();

    // Create REPL server
    const replServer = repl.start({
      prompt: '> ',
      useColors: true,
      useGlobal: false,
    });

    // Set up context with useful utilities
    this.setupContext(replServer);

    // Handle exit
    replServer.on('exit', () => {
      this.newLine();
      this.info('Goodbye!');
      process.exit(0);
    });
  }

  private setupContext(replServer: repl.REPLServer): void {
    // Add application to context
    replServer.context.app = this.app;

    // Add Prisma client
    replServer.context.prisma = getPrismaClient();

    // Add common utilities
    replServer.context.console = console;

    // Display available context
    this.comment('Available in context:');
    this.line('  - app: Application instance');
    this.line('  - prisma: Prisma client');
    this.line('  - console: Console object');
    this.newLine();
  }
}
