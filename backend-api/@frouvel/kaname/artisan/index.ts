#!/usr/bin/env node

/**
 * Artisan Console Entry Point
 *
 * PHP Artisan-like command line interface for frourio-framework.
 * This is the main entry point for running console commands.
 *
 * Usage:
 *   artisan <command> [options]
 *   artisan list
 *   artisan help <command>
 */

import app from '$/bootstrap/app';
import type { ConsoleKernel } from '$/@frouvel/kaname/foundation';

/*
|--------------------------------------------------------------------------
| Bootstrap The Console Application
|--------------------------------------------------------------------------
|
| We need to bootstrap the console application before running any commands.
| This ensures all service providers are loaded and the application is
| properly configured.
|
*/

async function main() {
  try {
    // Get the console kernel from the application container
    const kernel = app.make<ConsoleKernel>('ConsoleKernel');

    // Run the console application with command line arguments
    await kernel.run(process.argv);
  } catch (error) {
    console.error('Failed to run console application:', error);
    process.exit(1);
  }
}

// Run the application
main();