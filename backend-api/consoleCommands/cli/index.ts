#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('frourio-framework-cli')
  .description('frourio-framework CLI commands')
  .version('1.0.0');

// Register commands
// const addFreeTrialCommand = AddFreeTrialToExistingUsersCommand.create();
// program.addCommand(addFreeTrialCommand.getCommand());

program.parse();
