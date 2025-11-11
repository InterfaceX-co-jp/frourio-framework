/**
 * Configuration Usage Examples
 * 
 * This file demonstrates how to use the configuration system.
 * Run this file in Tinker to see the examples:
 * 
 * $ npm run artisan tinker
 * > import('./kaname/config/example')
 */

import { config, hasConfig, configAll } from './config';

export function demonstrateConfigUsage() {
  console.log('\n=== Configuration System Examples ===\n');

  // Example 1: Basic usage
  console.log('1. Basic Configuration Access:');
  const appName = config('app.name');
  console.log(`   App Name: ${appName}`);
  
  const appEnv = config('app.env');
  console.log(`   Environment: ${appEnv}`);
  
  // Example 2: Nested values
  console.log('\n2. Nested Configuration Values:');
  const jwtSecret = config('jwt.secret');
  console.log(`   JWT Secret: ${jwtSecret?.substring(0, 10)}...`);
  
  const dbUrl = config('database.connections.postgresql.url');
  console.log(`   Database URL: ${dbUrl?.substring(0, 20)}...`);
  
  // Example 3: Default values
  console.log('\n3. Configuration with Defaults:');
  const existingValue = config('app.name', 'Default Name');
  console.log(`   Existing (app.name): ${existingValue}`);
  
  const nonExistentValue = config('app.nonExistent', 'Fallback Value');
  console.log(`   Non-existent (app.nonExistent): ${nonExistentValue}`);
  
  // Example 4: Type safety
  console.log('\n4. Type-Safe Configuration:');
  const debug = config<boolean>('app.debug');
  console.log(`   Debug mode (boolean): ${debug}`);
  
  const poolMax = config<number>('database.pool.max');
  console.log(`   DB Pool Max (number): ${poolMax}`);
  
  // Example 5: Checking existence
  console.log('\n5. Checking Configuration Existence:');
  console.log(`   Has 'app.name': ${hasConfig('app.name')}`);
  console.log(`   Has 'app.nonExistent': ${hasConfig('app.nonExistent')}`);
  
  // Example 6: Getting all config for a file
  console.log('\n6. Getting All Configuration for a File:');
  const allAppConfig = configAll('app');
  console.log('   All App Config:', JSON.stringify(allAppConfig, null, 2));
  
  const allJwtConfig = configAll('jwt');
  console.log('   All JWT Config:', JSON.stringify(allJwtConfig, null, 2));
  
  console.log('\n=== End of Examples ===\n');
}

// Auto-run when imported in Tinker
demonstrateConfigUsage();