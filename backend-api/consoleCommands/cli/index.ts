#!/usr/bin/env node

import { Command } from 'commander';
import { ExampleCommand } from '../commands/Example.command';

const program = new Command();

program
  .name('frourio-framework-cli')
  .description('frourio-framework CLI commands')
  .version('1.0.0');

// Register commands
// const addFreeTrialCommand = AddFreeTrialToExistingUsersCommand.create();
// program.addCommand(addFreeTrialCommand.getCommand());

const exampleCommand = ExampleCommand.create();
program.addCommand(exampleCommand.getCommand());

program.parse();
