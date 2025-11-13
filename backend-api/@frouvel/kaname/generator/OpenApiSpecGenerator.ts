/**
 * OpenAPI Specification Generator
 *
 * Generates OpenAPI spec files from aspida route definitions.
 */

import { join } from 'path';
import type { OpenAPIV3 } from 'openapi-types';
import YAML from 'yaml';
import { FileGenerator } from './FileGenerator';
import type { OpenApiGenerator } from '../swagger/OpenApiGenerator';

export type OpenApiSpecFormat = 'json' | 'yaml';

export interface OpenApiSpecGeneratorOptions {
  basePath: string;
  format?: OpenApiSpecFormat;
  outputPath?: string;
}

export class OpenApiSpecGenerator extends FileGenerator {
  private readonly _basePath: string;
  private readonly _format: OpenApiSpecFormat;
  private readonly _outputPath?: string;

  constructor(
    private readonly openApiGenerator: OpenApiGenerator,
    options: OpenApiSpecGeneratorOptions,
  ) {
    super();
    this._basePath = options.basePath;
    this._format = options.format || 'yaml';
    this._outputPath = options.outputPath;
  }

  async execute(): Promise<void> {
    const prefix = '[📚:openapi]';

    console.log(`${prefix} [Generator] Generating OpenAPI specification...`);
    console.log(`${prefix} [Generator] Base path: ${this._basePath}`);
    console.log(
      `${prefix} [Generator] API path: ${join(this._basePath, 'api')}`,
    );

    const spec = this.openApiGenerator.generate();

    // Log discovery results
    const pathCount = Object.keys(spec.paths).length;
    console.log(`${prefix} [Generator] Title: ${spec.info.title}`);
    console.log(`${prefix} [Generator] Version: ${spec.info.version}`);
    console.log(`${prefix} [Generator] Discovered ${pathCount} path(s)`);

    if (pathCount > 0) {
      Object.keys(spec.paths).forEach((path) => {
        const pathItem = spec.paths[path];
        if (pathItem) {
          const methods = Object.keys(pathItem).join(', ').toUpperCase();
          console.log(`${prefix} [Generator]   ${methods} ${path}`);
        }
      });
    } else {
      console.warn(`${prefix} [Generator] ⚠️  No paths discovered!`);
      console.log(
        `${prefix} [Generator]   Check: ${join(this._basePath, 'api')}`,
      );
      console.log(
        `${prefix} [Generator]   Ensure routes have index.ts with DefineMethods`,
      );
    }

    const ext = this._format === 'yaml' ? 'yaml' : 'json';
    const outputPath =
      this._outputPath || join(this._basePath, `openapi.${ext}`);

    const content = this._formatContent(spec);

    this.generate({
      path: outputPath,
      content,
      overwrite: true,
    });

    console.log(
      `${prefix} [Generator] ✅ OpenAPI spec generated successfully!`,
    );
  }

  private _formatContent(spec: OpenAPIV3.Document): string {
    if (this._format === 'yaml') {
      return YAML.stringify(spec, { indent: 2 });
    }
    return JSON.stringify(spec, null, 2);
  }
}
