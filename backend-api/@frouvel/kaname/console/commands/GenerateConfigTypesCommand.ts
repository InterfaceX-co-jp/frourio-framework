/**
 * Generate Config Types Command
 * 
 * Generates config/types.ts from discovered configuration files.
 * 
 * Usage: npm run artisan generate:config-types
 */

import { Command } from '../Command';
import type { CommandSignature } from '../Command';
import { ConfigTypesGenerator } from '../../generator/ConfigTypesGenerator';
import app from '$/bootstrap/app';

export class GenerateConfigTypesCommand extends Command {
  protected signature(): CommandSignature {
    return {
      name: 'generate:config-types',
      description: 'Generate config/types.ts from config files',
      arguments: [],
      options: [],
    };
  }

  async handle(): Promise<void> {
    this.info('Generating config types...');

    const configPath = app.configPath();
    const generator = new ConfigTypesGenerator(configPath);

    await generator.execute();

    this.success('Config types generated successfully!');
    this.line('');
    this.line('💡 Tip: This file is auto-generated on every server start.');
    this.line('   Run this command manually if you need to regenerate it.');
  }
}