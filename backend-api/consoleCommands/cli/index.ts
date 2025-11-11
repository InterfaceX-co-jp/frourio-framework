#!/usr/bin/env node

/**
 * Console Entry Point (Artisan-like CLI)
 *
 * Bootstraps the application and runs console commands.
 * This is the entry point for CLI commands.
 */

import { Command } from 'commander';
import app from '$/bootstrap/app';
import type { ConsoleKernel } from '$/@frouvel/kaname/foundation';
import { ExampleCommand } from '../commands/Example.command';
import { ConfigCacheCommand } from '../commands/ConfigCache.command';
import { ConfigClearCommand } from '../commands/ConfigClear.command';

/*
|--------------------------------------------------------------------------
| Bootstrap The Application
|--------------------------------------------------------------------------
|
| We need to bootstrap the application before running commands. This
| ensures all service providers are loaded and the application is
| properly configured for executing console commands.
|
*/

const kernel = app.make<ConsoleKernel>('ConsoleKernel');

// Bootstrap the application
kernel.bootstrap().then(() => {
  /*
  |--------------------------------------------------------------------------
  | Define The Command Line Application
  |--------------------------------------------------------------------------
  */

  const program = new Command();

  program
    .name('frourio-framework-cli')
    .description('frourio-framework CLI commands')
    .version('1.0.0');

  /*
  |--------------------------------------------------------------------------
  | Register Commands
  |--------------------------------------------------------------------------
  */

  const exampleCommand = ExampleCommand.create();
  program.addCommand(exampleCommand.getCommand());

  // Config commands
  const configCacheCommand = ConfigCacheCommand.create();
  program.addCommand(configCacheCommand.getCommand());
  
  const configClearCommand = ConfigClearCommand.create();
  program.addCommand(configClearCommand.getCommand());

  /*
  |--------------------------------------------------------------------------
  | Run The Command Line Application
  |--------------------------------------------------------------------------
  */

  program.parse();
}).catch((error) => {
  console.error('Failed to bootstrap console application:', error);
  process.exit(1);
});
