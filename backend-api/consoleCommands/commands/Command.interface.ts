import { Command } from 'commander';

export interface ICommandLineInterface {
  getCommand: () => Command;
}
