import { Command } from 'commander';
import type { ICommandLineInterface } from './Command.interface';

interface ExecuteOptions {
  [key: string]: any;
}

export class ExampleCommand implements ICommandLineInterface {
  static create(): ExampleCommand {
    return new ExampleCommand();
  }

  getCommand(): Command {
    const command = new Command('example')
      .description('An example command that does nothing')
      .action(() => {
        this.execute({}); // You can pass options here if needed
      });

    return command;
  }

  private async execute(_options: ExecuteOptions) {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log('This is an example command that does nothing.');
  }
}
