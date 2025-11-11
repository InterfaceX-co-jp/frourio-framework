/**
 * File Generator Utility
 * 
 * Base class for file generation tasks.
 * Framework and users can extend this to create custom generators.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

export interface GeneratorOptions {
  path: string;
  content: string;
  overwrite?: boolean;
}

export abstract class FileGenerator {
  /**
   * Generate a file with the given content
   */
  protected generate(options: GeneratorOptions): void {
    const { path, content, overwrite = true } = options;

    // Create directory if it doesn't exist
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Check if file exists
    if (!overwrite && existsSync(path)) {
      console.warn(`[Generator] File already exists: ${path}`);
      return;
    }

    // Write file
    writeFileSync(path, content, 'utf-8');
    console.log(`[Generator] Generated: ${path}`);
  }

  /**
   * Execute the generator
   */
  abstract execute(): Promise<void> | void;
}