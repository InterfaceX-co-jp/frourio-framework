/**
 * Greet Command
 *
 * Example command demonstrating arguments and options.
 * Usage: artisan greet <name> [--title]
 */

import { Command, type CommandSignature } from '../Command';

interface GreetOptions {
  title?: string;
}

export class GreetCommand extends Command {
  protected signature(): CommandSignature {
    return {
      name: 'greet',
      description: 'Greet a user',
      arguments: [
        {
          name: 'name',
          description: 'The name of the user to greet',
          required: true,
        },
      ],
      options: [
        {
          flags: '-t, --title <title>',
          description: 'Title to use before the name (e.g., Mr., Ms., Dr.)',
        },
      ],
    };
  }

  handle(name: string, options: GreetOptions): void {
    const title = options.title || '';
    const fullName = title ? `${title} ${name}` : name;

    this.newLine();
    this.success(`Hello, ${fullName}! 👋`);
    this.comment('Welcome to frourio-framework!');
    this.newLine();
  }
}