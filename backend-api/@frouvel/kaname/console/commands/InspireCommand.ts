/**
 * Inspire Command
 *
 * Displays an inspiring quote.
 * Similar to Laravel's `php artisan inspire`
 */

import { Command, type CommandSignature } from '../Command';

export class InspireCommand extends Command {
  protected signature(): CommandSignature {
    return {
      name: 'inspire',
      description: 'Display an inspiring quote',
    };
  }

  handle(): void {
    const quotes = [
      'The only way to do great work is to love what you do. - Steve Jobs',
      'Innovation distinguishes between a leader and a follower. - Steve Jobs',
      'Stay hungry, stay foolish. - Steve Jobs',
      'Experience is the name everyone gives to their mistakes. - Oscar Wilde',
      'In order to be irreplaceable, one must always be different. - Coco Chanel',
      'Every great developer you know got there by solving problems they were unqualified to solve until they actually did it. - Patrick McKenzie',
      'The best error message is the one that never shows up. - Thomas Fuchs',
      'Simplicity is the soul of efficiency. - Austin Freeman',
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    this.newLine();
    this.comment(randomQuote);
    this.newLine();
  }
}
