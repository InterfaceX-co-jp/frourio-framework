#!/usr/bin/env tsx
/**
 * Standalone Config Types Generator
 *
 * Generates config/$types.ts without requiring full application bootstrap.
 * This is used during build/CI to generate types before type checking.
 */

import { ConfigTypesGenerator } from '../generator/ConfigTypesGenerator';
import { join } from 'path';

// Get config path relative to project root
const projectRoot = join(__dirname, '../../..');
const configPath = join(projectRoot, 'config');

async function main() {
  console.log('[Generator] Generating config types...');
  
  const generator = new ConfigTypesGenerator(configPath);
  await generator.execute();
  
  console.log('[Generator] ✅ Config types generated successfully!');
}

main().catch((error) => {
  console.error('[Generator] ❌ Failed to generate config types:', error);
  process.exit(1);
});