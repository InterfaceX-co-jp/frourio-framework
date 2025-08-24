import type { Command } from 'commander';

export interface ICommandLineInterface {
  getCommand: () => Command;
}
