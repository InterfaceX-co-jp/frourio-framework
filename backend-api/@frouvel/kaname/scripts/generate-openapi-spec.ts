#!/usr/bin/env tsx
/**
 * Standalone OpenAPI Spec Generator
 *
 * Generates openapi.yaml/json without requiring full application bootstrap.
 * This can be used during build/CI or for documentation generation.
 */

import { OpenApiGenerator } from '../swagger/OpenApiGenerator';
import { OpenApiSpecGenerator } from '../generator/OpenApiSpecGenerator';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Get project root
const projectRoot = join(__dirname, '../../..');
const basePath = projectRoot;

async function main() {
  // Get format from args (default: yaml)
  const format = process.argv.includes('--json') ? 'json' : 'yaml';
  const outputArg = process.argv.find((arg) => arg.startsWith('--output='));
  const outputPath = outputArg ? outputArg.split('=')[1] : undefined;

  // Create OpenAPI generator with config
  const openApiGen = OpenApiGenerator.create(
    {
      title: process.env.SWAGGER_TITLE || process.env.APP_NAME || 'API',
      version: process.env.SWAGGER_VERSION || '1.0.0',
      description:
        process.env.SWAGGER_DESCRIPTION || 'API Documentation',
      servers: [
        {
          url: process.env.APP_URL || 'http://localhost:31577',
          description:
            process.env.NODE_ENV === 'production'
              ? 'Production'
              : 'Development',
        },
      ],
      basePath,
      apiBasePath: process.env.API_BASE_PATH || '',
    },
    basePath,
  );

  // Create spec generator
  const generator = new OpenApiSpecGenerator(openApiGen, {
    basePath,
    format: format as 'json' | 'yaml',
    outputPath,
  });

  await generator.execute();
}

main().catch((error) => {
  console.error('[📚:openapi] [Generator] ❌ Failed to generate OpenAPI spec:', error);
  process.exit(1);
});