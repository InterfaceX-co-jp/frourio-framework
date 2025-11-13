import { Command } from '$/@frouvel/kaname/console/Command';
import type { Application } from '$/@frouvel/kaname/foundation';
import type { OpenApiGenerator } from '$/@frouvel/kaname/swagger/OpenApiGenerator';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class GenerateOpenApiCommand extends Command {
  constructor(app: Application) {
    super(app);
  }

  protected signature() {
    return {
      name: 'openapi:generate',
      description: 'Generate OpenAPI specification file',
      options: [
        {
          flags: '-o, --output <path>',
          description: 'Output file path (default: openapi.json)',
        },
      ],
    };
  }

  async handle(options: { output?: string }) {
    const generator = this.app.make<OpenApiGenerator>('swagger');

    this.info('Generating OpenAPI specification...');
    this.line(`Base path: ${this.app.basePath()}`);
    this.line(`API path: ${join(this.app.basePath(), 'api')}`);

    const spec = generator.generate();

    // Log some diagnostic info
    this.line(`\nGenerated spec info:`);
    this.line(`- Title: ${spec.info.title}`);
    this.line(`- Version: ${spec.info.version}`);
    this.line(`- Paths count: ${Object.keys(spec.paths).length}`);
    
    if (Object.keys(spec.paths).length > 0) {
      this.line(`\nDiscovered paths:`);
      Object.keys(spec.paths).forEach((path) => {
        this.line(`  ${path}`);
      });
    } else {
      this.warn('\n⚠️  No paths discovered! Check:');
      this.line(`  1. API directory exists at: ${join(this.app.basePath(), 'api')}`);
      this.line(`  2. Routes have index.ts files with DefineMethods`);
    }

    const outputPath =
      options.output || join(this.app.basePath(), 'openapi.json');

    const content = JSON.stringify(spec, null, 2);

    writeFileSync(outputPath, content, 'utf-8');

    this.success(`\n✓ OpenAPI spec generated: ${outputPath}`);
  }
}